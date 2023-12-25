import { checkHttpStatus } from "./base-service";

export const getPackages = async (packageName, version) => {
    const regex = /[^0-9.]/g;
	const rawVersionNumber = version.replaceAll(regex, "");
    const res = await fetch(`${process.env.REACT_APP_BFF_URL}/npm/${packageName}/${rawVersionNumber}`);
    return await checkHttpStatus(res);
  };