import * as Auth from './Auth'
import axios, { AxiosInstance, AxiosResponse } from 'axios';
export { Auth };

export const getRequest = <R>(...params: Parameters<AxiosInstance>) => {
	return Auth.requestWithCognito((token: string) => {
		const instance = axios.create({
			baseURL: process.env.REACT_APP_UA_API,
			headers: { Authorization: `${token}`, Accept: 'application/json' }
		})
		return instance.get<any, AxiosResponse<R>>(...params);
	})
}

export const postRequest = <R>(...params: Parameters<AxiosInstance['post']>) => {
	return Auth.requestWithCognito((token: string) => {
		const instance = axios.create({
			baseURL: process.env.REACT_APP_UA_API,
			headers: { Authorization: `${token}`, Accept: 'application/json' }
		})
		return instance.post<any, AxiosResponse<R>>(...params);
	})
}
