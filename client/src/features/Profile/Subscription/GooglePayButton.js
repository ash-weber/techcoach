import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CircularProgress, Box } from "@mui/material";
import { captureOneTimeOrder, createOneTimeOrder } from "../../../api/Subscription/Network_Call";

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      if (window.paypal) return resolve();
      existingScript.addEventListener("load", resolve);
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
};

const GooglePayButton = ({ amount = "12.00", onSuccess, onError }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.REACT_APP_ENV === "production";

  const paypalSdkUrl = isProduction
    ? "https://www.paypal.com/web-sdk/v6/core"
    : "https://www.sandbox.paypal.com/web-sdk/v6/core";

  const googlePayEnv = isProduction ? "PRODUCTION" : "TEST";

  useEffect(() => {
    let isMounted = true;

    const initGooglePay = async () => {
      try {
        await loadScript(paypalSdkUrl);

        if (!window.paypal || !window.google) {
          setTimeout(initGooglePay, 300);
          return;
        }

        const sdkInstance = await window.paypal.createInstance({
          clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
          components: ["googlepay-payments"],
          pageType: "checkout",
        });

        const googlePaySession = sdkInstance.createGooglePayOneTimePaymentSession();
        const googlePayConfig = await googlePaySession.getGooglePayConfig();

        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: googlePayEnv,
          paymentDataCallbacks: {
            onPaymentAuthorized: async (paymentData) => {
              try {
                

                const orderPayload = {
                  intent: "CAPTURE",
                  purchase_units: [
                    {
                      amount: {
                        currency_code: "USD",
                        value: amount,
                        breakdown: {
                          item_total: {
                            currency_code: "USD",
                            value: amount,
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

                const createRes = await createOneTimeOrder(orderPayload);

                const orderId = createRes.id;

                const { status } = await googlePaySession.confirmOrder({
                  orderId,
                  paymentMethodData: paymentData.paymentMethodData,
                });

                if (status !== "PAYER_ACTION_REQUIRED") {
                  const captureRes = await captureOneTimeOrder(orderId);

                  if (onSuccess) onSuccess(captureRes);
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
        } else {
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
  }, [amount, paypalSdkUrl, googlePayEnv]);

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