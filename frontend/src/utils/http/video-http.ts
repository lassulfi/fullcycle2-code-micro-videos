import { httpVideo } from ".";
import HttpResource from "./http-resource";

const videoHttp = new HttpResource(httpVideo, 'videos');

export default videoHttp;