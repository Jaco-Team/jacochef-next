import { useState } from "react";

export default function useMyAlert() {
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState(true);

  const showAlert = (message, isError = false) => {
    setAlertMessage(message);
    setAlertStatus(isError);
    setIsAlert(true);
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
