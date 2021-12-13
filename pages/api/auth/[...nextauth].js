import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import spotifyAPI, { LOGIN_URL } from "../../../lib/spotify";

/* Generate new access token */
async function refreshAccessToken(token) {
	try {
		spotifyAPI.setAccessToken(token.accessToken);
		spotifyAPI.setRefreshToken(token.refreshToken);

		const { body: refreshedToken } = await spotifyAPI.refreshAccessToken(); // destructor the response

		console.log("refreshed token is ", refreshedToken);

		return {
			...token,
			accessToken: refreshedToken.access_token,
			accessTokenExpires: Date.now + refreshedToken.expires_in * 1000, // 1 hour as 3600 returns from spotifyAPI
			/* if refresh token gets returned then use that token if not use default token*/
			refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
		};
	} catch (error) {
		console.log(error);

		return {
			...token,
			error: "RefreshAccessTokenError",
		};
	}
}

export default NextAuth({
	// Configure one or more authentication providers
	// use environment variables here
	providers: [
		SpotifyProvider({
			clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
			clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
			// this sends the user to the spotify login page and tells spotify to give specific permissions
			authorization: LOGIN_URL,
		}),
		// ...add more providers here
	],
	secret: process.env.JWT_SECRET,
	pages: {
		signIn: "/login",
	},
	callbacks: {
		/* spotify sends token back to app after logging in */
		/* take that token and autogenerate a new token if the previous one is expired */
		async jwt({ token, account, user }) {
			/* if inital sign in then it will return account and user variables */
			if (account && user) {
				console.log("New user identified...");
				return {
					...token,
					accessToken: account.access_token, // this is a token given by Spotify
					refreshToken: account.refresh_token, // this is a token given by Spotify
					username: account.providerAccountId, // this is the spotify user account ID
					accessTokenExpires: account.expires_at * 1000, // handle expiry times in milliseconds instead of seconds i.e. '* 1000'
				};
			}

			/* return previous token if the access token has not expired yet */
			if (Date.now() < token.accessTokenExpires) {
				// if current time is less than the current access token then return the token
				console.log("Exisiting token is valid");
				return token;
			}

			/* access token has expired, need to generate new token */
			console.log("Exisiting token is expired, generating...");
			return await refreshAccessToken(token);
		},

		async session({ session, token }) {
			/* This is the part that the user can see */
			session.user.accessToken = token.accessToken;
			session.user.refreshToken = token.refreshToken;
			session.user.username = token.username;
			return session;
		},
	},
});
