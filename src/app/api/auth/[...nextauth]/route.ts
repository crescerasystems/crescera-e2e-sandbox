import { handlers } from "@/lib/auth"

// NextAuth v5 returns `handlers` as an object containing GET + POST.
// Destructure here so Next's App Router picks them up as the route's
// exported HTTP methods.
export const { GET, POST } = handlers
