/**
 * AUTHORIZATION CONTRACT
 * 
 * Single source of truth for role checks across the application:
 * 
 * session.user.role === "ADMIN" | "OFFICER"
 * 
 * ============================================
 * 
 * ROLE INJECTION CHAIN (Auth0 → NextAuth → Session):
 * 
 * 1. Auth0 Custom Claim
 *    - Claim: "https://occamy-field-ops/role"
 *    - Type: string (not array)
 *    - Values: "ADMIN" or "OFFICER"
 *    - Fallback: "OFFICER" if not set
 * 
 * 2. NextAuth JWT Callback
 *    - Copies user.role (string) into token.role
 *    - Ensures consistency in JWT payload
 * 
 * 3. NextAuth Session Callback
 *    - Copies token.role (string) into session.user.role
 *    - Final injection into user context
 * 
 * 4. Application Usage
 *    - All code uses: session.user.role as string
 *    - No roles array, no permissions object
 *    - No optional chaining uncertainty
 * 
 * ============================================
 * 
 * AUTHORIZATION RULES:
 * 
 * ADMIN Permissions:
 * - View all activities (no userId filter)
 * - View all users
 * - Access admin dashboard
 * - Access all analytics
 * 
 * OFFICER Permissions:
 * - View own activities only (filtered by userId)
 * - Edit/delete own activities
 * - Access officer dashboard
 * - Access own analytics
 * 
 * ============================================
 * 
 * ENFORCEMENT POINTS:
 * 
 * 1. Middleware (Route Protection)
 *    - /dashboard/admin → ADMIN only
 *    - /dashboard/officer → OFFICER only
 *    - Redirect non-matching roles
 * 
 * 2. Server Components (Page-level)
 *    - getServerSession(authOptions)
 *    - Check session.user.role
 *    - Redirect if unauthorized
 * 
 * 3. API Routes (Data-level)
 *    - getServerSession(authOptions)
 *    - Officers: WHERE userId = session.user.id
 *    - Admins: No WHERE filter (see all)
 *    - Return 403 if role mismatch
 * 
 * ============================================
 * 
 * EXAMPLE: API Authorization Pattern
 * 
 * export async function GET(req: NextRequest) {
 *   const session = await getServerSession(authOptions);
 *   if (!session?.user) return 401;
 * 
 *   const role = session.user.role; // "ADMIN" | "OFFICER"
 *   
 *   // Officers see only own data
 *   if (role === "OFFICER") {
 *     query.where = { userId: session.user.id };
 *   }
 *   // Admins see all data (no WHERE filter)
 *   
 *   return data;
 * }
 * 
 * ============================================
 * 
 * WHAT NOT TO DO:
 * 
 * ❌ session.user.roles (array)
 * ❌ session.user.permissions (object)
 * ❌ Optional chaining: session?.user?.role?.[0]
 * ❌ Type coercion: role as "ADMIN"
 * ❌ String includes: role?.includes("ADMIN")
 * 
 * ALWAYS DO:
 * 
 * ✅ session.user.role === "ADMIN"
 * ✅ session.user.role === "OFFICER"
 * ✅ if (!session?.user) return 401
 * ✅ const role = session.user.role (then use)
 * 
 * ============================================
 */
