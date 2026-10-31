import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CircularProgress, Box, Typography } from "@mui/material";

const GooglePayButton = ({ amount = "12.00", onSuccess, onError }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initGooglePay = async () => {
      try {
        if (!window.paypal || !window.google) {
          setTimeout(initGooglePay, 500);
          return;
        }

        const sdkInstance = await window.paypal.createInstance({
          clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
          components: ["googlepay-payments"],
          pageType: "checkout",
        });

        const googlePaySession =
          sdkInstance.createGooglePayOneTimePaymentSession();
        const googlePayConfig = await googlePaySession.getGooglePayConfig();

        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
          paymentDataCallbacks: {
            onPaymentAuthorized: async (paymentData) => {
              try {
                const token = localStorage.getItem("token");

                const orderPayload = {
                  intent: "CAPTURE",
                  purchase_units: [
                    {
                      amount: {
                        currency_code: "USD",
                        value: "12.00",
                        breakdown: {
                          item_total: {
                            currency_code: "USD",
                            value: "12.00",
                          },
                        },
                      },
                    },
                  ],
                  payment_source: {
                    google_pay: {
                      attributes: {
                        verification: {
                          method: "SCA_WHEN_REQUIRED",
                        },
                      },
                    },
                  },
                };

                const createRes = await axios.post(
                  `${process.env.REACT_APP_API_URL}/api/subscription/orders/create`,
                  orderPayload,
                  { headers: { Authorization: `Bearer ${token}` } },
                );

                const orderId = createRes.data.id;

                const { status } = await googlePaySession.confirmOrder({
                  orderId,
                  paymentMethodData: paymentData.paymentMethodData,
                });

                if (status !== "PAYER_ACTION_REQUIRED") {
                  const captureRes = await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/subscription/orders/${orderId}/capture`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } },
                  );

                  if (onSuccess) onSuccess(captureRes.data);
                }

                return { transactionState: "SUCCESS" };
              } catch (err) {
                console.error("Authorization error:", err);
                if (onError) onError(err);
                return {
                  transactionState: "ERROR",
                  error: { message: err.message },
                };
              }
            },
          },
        });

        const isReadyToPay = await paymentsClient.isReadyToPay({
          allowedPaymentMethods: googlePayConfig.allowedPaymentMethods,
          apiVersion: googlePayConfig.apiVersion,
          apiVersionMinor: googlePayConfig.apiVersionMinor,
        });

        if (isReadyToPay.result && isMounted && containerRef.current) {
          containerRef.current.innerHTML = "";
          const button = paymentsClient.createButton({
            onClick: () => {
              const paymentDataRequest = {
                apiVersion: googlePayConfig.apiVersion,
                apiVersionMinor: googlePayConfig.apiVersionMinor,
                allowedPaymentMethods: googlePayConfig.allowedPaymentMethods,
                merchantInfo: googlePayConfig.merchantInfo,
                callbackIntents: ["PAYMENT_AUTHORIZATION"],
                transactionInfo: {
                  countryCode: googlePayConfig.countryCode || "US",
                  currencyCode: "USD",
                  totalPriceStatus: "FINAL",
                  totalPrice: amount,
                  totalPriceLabel: "Total",
                },
              };

              paymentsClient
                .loadPaymentData(paymentDataRequest)
                .catch((err) => {
                  console.error("loadPaymentData error:", err);
                });
            },
          });
          containerRef.current.appendChild(button);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load Google Pay button:", err);
        setLoading(false);
      }
    };

    initGooglePay();

    return () => {
      isMounted = false;
    };
  }, [amount]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 2,
      }}
    >
      {loading && <CircularProgress size={24} sx={{ mb: 1 }} />}
      <div ref={containerRef} id="googlepay-button-container" />
    </Box>
  );
};

export default GooglePayButton;
