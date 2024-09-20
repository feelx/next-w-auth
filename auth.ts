import { signInSchema } from "@/lib/zod"
import { Client } from "ldapts"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "ldap",
      name: "LDAP",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        let user = null

        const { username, password } = await signInSchema.parseAsync(credentials)

        const client = new Client({
          url: process.env.LDAP_URL!,
          timeout: parseInt(process.env.LDAP_TIMEOUT!),
          connectTimeout: parseInt(process.env.LDAP_CONNECTION_TIMEOUT!),
        })

        try {
          await client.bind(process.env.LDAP_BIND_DN!, process.env.LDAP_BIND_PASSWORD)
        } catch (error) {
          console.log(error)
          throw new Error("Failed to bind to LDAP server")
        }

        let searchResult = null
        try {
          searchResult = await client.search(process.env.LDAP_SEARCH_BASE!, {
            filter: `(&(objectClass=user)(uid=${credentials?.username}))`,
            scope: "sub",
            attributes: ["uid", "cn", "mail"]
          })
          const ldapUserData = searchResult.searchEntries[0]
          user = {
            id: ldapUserData.uid.toString(),
            name: ldapUserData.cn.toString(),
            email: ldapUserData.mail.toString(),
          }
        } catch (error) {
          console.log(error)
          throw new Error("User not found")
        }

        const userCn = searchResult.searchEntries[0].cn.toString()

        console.log(userCn)

        try {
          await client.bind(username, password)
        } catch (error) {
          console.log(error)
          throw new Error("Failed to bind as user")
        }

        return user
      }
    })
  ],
})