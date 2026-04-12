import app from "./index";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Reset Pixel Art Tool API listening on port ${PORT}`);
});