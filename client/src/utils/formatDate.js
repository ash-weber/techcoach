export const formatDate = (inputDate) => {
    if (!inputDate) return "--";
    const date = new Date(inputDate);
    return date.toLocaleDateString(navigator.language, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  