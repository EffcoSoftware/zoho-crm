import axios from "axios";
import { reduce } from "lodash";
import log from "./logger";
import storage from "./storage";
import {
  ITokenStore,
  ITokenGenerate,
  ITokenRefresh,
  IConfig
} from "../interfaces";
import {
  getTokenGenerateUrl,
  getTokenRefreshUrl,
  getZohoUrl
} from "./urlGenerators";

enum Token {
  Access = "accessToken",
  Refresh = "refreshToken"
}

const getTokens = async (config: IConfig): Promise<ITokenStore> => {
  const zohoTokens = await storage.get(config.tokenStore);
  return zohoTokens;
};

const validToken = (expiry: number): boolean => {
  const timeToExpire = expiry - 60 * 1000 - new Date().getTime();
  const minutesToExpire = Math.round(timeToExpire / 60000);
  if (minutesToExpire >= 0)
    log("utils", "validToken", `Token expires in ${minutesToExpire}m`, "info");
  return minutesToExpire >= 0;
};

const formatTokensForStore = (
  tokenData: {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  },
  oldTokenStore?: ITokenStore
): ITokenStore => {
  let refreshToken = "";
  if (oldTokenStore) refreshToken = oldTokenStore.refreshToken;
  if (tokenData.refresh_token) refreshToken = tokenData.refresh_token;
  const tokenStore: ITokenStore = {
    accessToken: tokenData.access_token,
    expiry: new Date().getTime() + tokenData.expires_in,
    refreshToken
  };
  return tokenStore;
};

const replaceSpace = (key: string, revert: boolean = false) =>
  !revert
    ? key.replace(new RegExp(" ", "g"), "_")
    : key.replace(new RegExp("_", "g"), " ");

const replaceSpaces = (
  items: Array<{}>,
  revert: boolean = false
): Array<{}> => {
  const mapped = items.map(
    (i: object): object => {
      const reducedItem = reduce(
        i,
        (result: object, value: string, key: string): object => {
          const newKey = replaceSpace(key, revert);

          result[newKey] = value;

          return result;
        },
        {}
      );
      return reducedItem;
    }
  );

  return mapped;
};

const getQueryFields = (columns: Array<string>): string => {
  if (!columns.length) return "";
  const columnsWithoutSpaces = columns.map(c => replaceSpace(c));
  return `?fields=${columnsWithoutSpaces.join(",")}`;
};

const getTokenFromGrantToken = async (config: IConfig): Promise<string> => {
  log(
    "utils",
    "getTokenFromGrantToken",
    "Obtaining tokens using Grant Token",
    "warn"
  );
  try {
    // retrieve information from env vars
    const grantTokenData: ITokenGenerate = {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: `${config.apiUrl}/oauth/zoho`,
      grantToken: config.grantToken,
      location: config.location
    };
    const url = getTokenGenerateUrl(grantTokenData);

    // send request to Zoho for tokens
    const { data } = await axios.post(url);
    if (data.error) throw new Error(`Zoho error: ${data.error}`);
    // format received data for storage
    const formattedData = formatTokensForStore(data);

    await storage.set(config.tokenStore, formattedData);
    return formattedData.accessToken;
  } catch (e) {
    log("utils", "getTokenFromGrantToken", e.message);
    return "";
  }
};

const getRefreshedToken = async (
  config: IConfig,
  zohoTokens: ITokenStore
): Promise<string> => {
  log("utils", "getRefreshedToken", "Refreshing token", "info");
  try {
    // retrieve information from env vars
    const refreshTokenData: ITokenRefresh = {
      refreshToken: zohoTokens.refreshToken,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      location: config.location
    };
    const url = getTokenRefreshUrl(refreshTokenData);

    // send request to Zoho for tokens
    const { data } = await axios.post(url);
    if (data.error) throw new Error(`Zoho error: ${data.error}`);
    // format received data for storage
    const formattedData = formatTokensForStore(data, zohoTokens);

    await storage.set(config.tokenStore, formattedData);
    return formattedData.accessToken;
  } catch (e) {
    log("utils", "getRefreshedToken", e.message);
    return "";
  }
};

const getToken = async (
  config: IConfig,
  tokenType: Token = Token.Access
): Promise<string> => {
  try {
    // retrieve token data from token storage
    const zohoTokens = await getTokens(config);

    let token = zohoTokens[tokenType];
    // if no token, generate from ZOHO_GRANT_TOKEN, save & return
    if (!token) {
      return getTokenFromGrantToken(config);
    }
    const { expiry } = zohoTokens;
    if (!expiry) {
      throw new Error(`Token has no expiry date`);
    }
    // if token expired, refresh access token, save & return
    if (!validToken(expiry)) {
      return getRefreshedToken(config, zohoTokens);
    }
    // token is valid, just return it
    return token;
  } catch (e) {
    log("utils", "getToken", e.message);
    return "";
  }
};

export default {
  getToken: (config: IConfig) => getToken(config),
  getUrl: getZohoUrl,
  log,
  replaceSpaces,
  getQueryFields
};
