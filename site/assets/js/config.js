/* GrowDev — site settings. Edit this file to change contact details or defaults. */
window.GD = window.GD || {};
GD.config = {
  email: "contact@werchti.tn",
  // Simulator: hourly cost of one working hour per currency. Rough, editable assumptions (visitors can change them).
  hourlyCost: { TND: 15, MAD: 50, DZD: 700, EGP: 250, XOF: 3000, EUR: 20, USD: 22 },
  // The dinar comes first for everyone: Tunisia first, then Africa, then the world.
  defaultCurrency: "TND"
};
