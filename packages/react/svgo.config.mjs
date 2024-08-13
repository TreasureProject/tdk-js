export default {
  plugins: [
    "convertStyleToAttrs",
    {
      name: "convertColors",
      params: {
        currentColor: true,
      },
    },
  ],
};
