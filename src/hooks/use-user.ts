"use client";

// useUser is a thin convenience wrapper over useUserContext so that call-sites
// import from @/hooks/use-user rather than knowing about the provider internals.
// It can only be called inside components that are descendants of UserProvider
// (i.e. any component rendered within the (protected) layout).
export { useUserContext as useUser } from "@/components/providers/user-provider";
