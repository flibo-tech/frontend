import axios from "axios";
var CancelToken = axios.CancelToken;
let source = CancelToken.source();
  setTimeout(() => {
    source.cancel();
  }, 5000);

const defaultInfo = {
    ip: null,
    city: null,
    region: null,
    country: 'IN',
    loc: null,
    org: null,
    postal: null,
    timezone: null
}

const getUserIp = async () => {
    return await axios
        .get("https://api.ipify.org/?format=json", {cancelToken: source.token})
        .then(function (response) {
            if ([200].includes(response.status)) {
                return response.data.ip
            } else {
                return null
            }
        })
        .catch(function(err) {
            return null
        })
}

const ipInfoBackup = async () => {
    const userIp = await getUserIp()
    if (userIp) {
        return await axios
            .get(`https://ipapi.co/${userIp}/country`, {cancelToken: source.token})
            .then(function (response) {
                if ([200].includes(response.status)) {
                    return {
                        ip: userIp,
                        city: null,
                        region: null,
                        country: response.data,
                        loc: null,
                        org: null,
                        postal: null,
                        timezone: null
                    }
                } else {
                    return defaultInfo  
                }
            })
            .catch(function(err) {
                if (axios.isCancel(err)) {
                return defaultInfo
                }
                else {
                return defaultInfo
                }
            })
    } else {
        return defaultInfo
    }
}

export const ipInfo = async () => {
    return await axios
        .get("https://ipinfo.io/?token=a354c067e1fef5", {cancelToken: source.token})
        .then(function (response) {
            if ([200].includes(response.status)) {
                return response.data
            } else {
                return defaultInfo  
            }
        })
        .catch(async function(err) {
            if (axios.isCancel(err)) {
              return await ipInfoBackup()
            }
            else {
              return await ipInfoBackup()
            }
        })
}