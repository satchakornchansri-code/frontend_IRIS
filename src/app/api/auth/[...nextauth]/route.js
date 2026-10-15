import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions = {
  
  trustHost: true, 
  
  
  debug: true,

  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      
       
      authorization: {
        params: {
          scope: "openid profile email User.Read offline_access",
          
          response_mode: "query", 
          prompt: "select_account",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
    error: "/signin", // เวลา error จะเด้งกลับมาหน้านี้พร้อม query param
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log("Redirect URL:", url);
      console.log("Base URL:", baseUrl);
      
      
      if (url === "/" || url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/`;
      }
      
      if (url.startsWith(baseUrl)) {
        const path = url.replace(baseUrl, "");
        if (path === "/" || path === "") {
          return `${baseUrl}/`;
        }
      }
      
      return `${baseUrl}/job`;
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.provider = token.provider;
      session.user.id = token.userId;
      return session;
    },
  },
};

const handler = NextAuth(authOptions); 
export { handler as GET, handler as POST };