import { reactMountPlugin, getStaticInfoPlugin } from "../plugins.js"

export default {
  plugins: [reactMountPlugin(), getStaticInfoPlugin()],
}
