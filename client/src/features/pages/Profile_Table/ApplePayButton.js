import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CircularProgress, Box, Typography } from "@mui/material";

const ApplePayButton = ({ amount = "12.00", onSuccess, onError }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initApplePay = async () => {
      try {
        /*   if (
          !window.ApplePaySession  || !ApplePaySession.canMakePayments() 
        ) {
          if (isMounted) {
            setIsSupported(false);
            setLoading(false);
          }
          return;
        } */

        if (!window.ApplePaySession) {
          window.ApplePaySession = class MockApplePaySession {
            static canMakePayments() {
              return true;
            }
            static STATUS_SUCCESS = 1;
            static STATUS_FAILURE = 0;

            constructor(version, paymentRequest) {
              this.paymentRequest = paymentRequest;
            }

            begin() {
              if (this.onvalidatemerchant) {
                this.onvalidatemerchant({
                  validationURL:
                    "https://apple-pay-gateway-cert.apple.com/paymentSession",
                });
              }
            }

            completeMerchantValidation(merchantSession) {
              setTimeout(() => {
                if (
                  window.confirm(
                    "Simulate approving Apple Pay with fingerprint/FaceID?",
                  )
                ) {
                  if (this.onpaymentauthorized) {
                    this.onpaymentauthorized({
                      payment: {
                        token: { paymentData: {} },
                        billingContact: {
                          givenName: "Test",
                          familyName: "User",
                          emailAddress: "test@example.com",
                        },
                      },
                    });
                  }
                }
              }, 800);
            }

            completePayment(status) {
              console.log(status);
            }

            abort() {
              console.log("Apple Pay aborted");
            }
          };
        }

        if (!window.paypal) {
          setTimeout(initApplePay, 500);
          return;
        }

        const token = localStorage.getItem("token");

        const tokenRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/subscription/client-token`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const clientToken = tokenRes.data.clientToken;

        const sdkInstance = await window.paypal.createInstance({
          clientToken,
          components: ["applepay-payments"],
          pageType: "checkout",
        });

        const applePaySession =
          await sdkInstance.createApplePayOneTimePaymentSession();
        const { merchantCapabilities, supportedNetworks } =
          await applePaySession.config();

        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = `
            <apple-pay-button 
              id="apple-pay-btn" 
              buttonstyle="black" 
              type="buy" 
              locale="en"
              style="display: inline-block; -webkit-appearance: -apple-pay-button; width: 220px; height: 40px; border-radius: 4px; cursor: pointer;">
            </apple-pay-button>
          `;

          const applePayBtn = document.getElementById("apple-pay-btn");
          applePayBtn.addEventListener("click", () => {
            const paymentRequest = {
              countryCode: "US",
              currencyCode: "USD",
              merchantCapabilities,
              supportedNetworks,
              requiredBillingContactFields: ["name", "email"],
              total: {
                label: "Decision Coach 1-Year Access",
                amount: amount,
                type: "final",
              },
            };

            const session = new window.ApplePaySession(4, paymentRequest);

            session.onvalidatemerchant = async (event) => {
              try {
                const payload = await applePaySession.validateMerchant({
                  validationUrl: event.validationURL,
                });
                session.completeMerchantValidation(payload.merchantSession);
              } catch (err) {
                console.error("Merchant validation error:", err);
                session.abort();
              }
            };

            session.onpaymentauthorized = async (event) => {
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
                };

                const createRes = await axios.post(
                  `${process.env.REACT_APP_API_URL}/api/subscription/orders/create`,
                  orderPayload,
                  { headers: { Authorization: `Bearer ${token}` } },
                );

                const orderId = createRes.data.id;

                await applePaySession.confirmOrder({
                  orderId,
                  token: event.payment.token,
                  billingContact: event.payment.billingContact,
                });

                const captureRes = await axios.post(
                  `${process.env.REACT_APP_API_URL}/api/subscription/orders/${orderId}/capture`,
                  {},
                  { headers: { Authorization: `Bearer ${token}` } },
                );

                session.completePayment({
                  status: window.ApplePaySession.STATUS_SUCCESS,
                });

                if (onSuccess) onSuccess(captureRes.data);
              } catch (err) {
                console.error("Apple Pay authorization error:", err);
                session.completePayment({
                  status: window.ApplePaySession.STATUS_FAILURE,
                });
                if (onError) onError(err);
              }
            };

            session.begin();
          });

          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load Apple Pay:", err);
        if (isMounted) setLoading(false);
      }
    };

    initApplePay();

    return () => {
      isMounted = false;
    };
  }, [amount]);

  if (!isSupported) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Apple Pay is only supported on Apple devices (Safari on iOS / macOS).
      </Typography>
    );
  }

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
      <div ref={containerRef} id="apple-pay-button-container" />
    </Box>
  );
};

export default ApplePayButton;
