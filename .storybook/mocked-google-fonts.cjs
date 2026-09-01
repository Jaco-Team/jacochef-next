const robotoCss = `
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: local('Arial');
}
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Arial');
}
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: local('Arial');
}
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Arial');
}
`;

module.exports = {
  "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap": robotoCss,
  "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=block": robotoCss,
};
