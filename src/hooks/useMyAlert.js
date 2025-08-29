import { useState } from "react";

const defaultDelay = 3000;

export default function useMyAlert(delay = defaultDelay) {
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState(true);
  const [alertTimeout, setAlertTimeout] = useState(null);

  const showAlert = (message, isError = false) => {
    setAlertMessage(message);
    setAlertStatus(isError);
    setIsAlert(true);
    if (alertTimeout) clearTimeout(alertTimeout);
    setAlertTimeout(setTimeout(() => {
      closeAlert();
    }, delay));
  };

  const closeAlert = () => {
    setIsAlert(false);
    setAlertMessage("");
  };

  return {
    isAlert,
    showAlert,
    closeAlert,
    alertStatus,
    alertMessage,
  };
}
