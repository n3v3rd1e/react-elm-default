import * as Api from "@/Api";
import { Session } from "@/modules/Session";

export type Model = {
	email: string;
	name: string;
	surname: string;
	profilePictureURL: string;
};

export const fromSession = (session: Session): Model => {
	const { email, family_name, given_name, picture } = Api.Auth.getUser(
		session
	);
	return {
		email,
		name: given_name,
		surname: family_name,
		profilePictureURL: picture
	};
};
