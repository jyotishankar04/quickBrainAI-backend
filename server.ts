import app from "./src/app";
import _env from "./src/config/envConfig";
import { feedSkills } from "./src/utils/feed";

app.listen(_env.PORT, () => {
  console.log("Server is running on port " + _env.PORT);
});
