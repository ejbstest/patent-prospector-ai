# AI Development Rules

This document outlines the rules and conventions for AI-driven development on this project. Adhering to these guidelines ensures consistency, maintainability, and leverages the chosen tech stack effectively.

## Tech Stack Overview

This project is built with a modern, type-safe, and component-driven stack:

*   **Framework**: React (with Vite for a fast development experience).
*   **Language**: TypeScript for type safety and improved developer experience.
*   **UI Components**: shadcn/ui, a collection of beautifully designed, accessible components built on Radix UI and Tailwind CSS.
*   **Styling**: Tailwind CSS for all styling, following a utility-first approach.
*   **Routing**: React Router (`react-router-dom`) for all client-side navigation.
*   **State Management**: Zustand for simple, powerful global state management.
*   **Data Fetching**: TanStack Query (`react-query`) for managing server state, caching, and data fetching.
*   **Forms**: React Hook Form with Zod for robust, type-safe form validation and management.
*   **Backend & Database**: Supabase for authentication, database (PostgreSQL), and storage.
*   **Icons**: Lucide React for a comprehensive and consistent set of icons.

## Library Usage Rules

To maintain consistency, please follow these specific rules for using libraries:

### 1. UI and Styling

*   **Components**: **ALWAYS** use components from the `shadcn/ui` library (`@/components/ui/...`) whenever possible. Do not create custom buttons, inputs, cards, etc., if a shadcn/ui equivalent exists.
*   **Styling**: **ALWAYS** use Tailwind CSS utility classes for styling. Do not write custom CSS in `.css` files or use inline `style` objects.
*   **Conditional Classes**: Use the `cn` utility from `@/lib/utils` to merge and conditionally apply Tailwind classes.

### 2. State Management

*   **Local State**: For state that is confined to a single component, use React's built-in hooks (`useState`, `useReducer`).
*   **Global State**: For state that needs to be shared across multiple, non-related components (e.g., user settings, form wizard state), use **Zustand**. Create stores in the `src/stores/` directory.

### 3. Data Fetching

*   **Server State**: **ALWAYS** use TanStack Query (`useQuery`, `useMutation`) for any interaction with the Supabase database or external APIs. This handles caching, loading states, error handling, and refetching automatically. Do not use `useEffect` with `fetch` directly.

### 4. Forms

*   **Form Logic**: **ALWAYS** use `React Hook Form` (`useForm`) for managing form state, validation, and submission.
*   **Validation**: **ALWAYS** use `Zod` to define validation schemas for your forms. Use `@hookform/resolvers/zod` to connect Zod schemas to React Hook Form.
*   **Form Components**: Integrate React Hook Form with `shadcn/ui`'s `<Form />` components for accessible and consistent form fields.

### 5. Routing and Navigation

*   **Routing**: All page routes are managed by `React Router`. Routes are defined in `src/App.tsx`.
*   **Links**: Use the `<Link>` component from `react-router-dom` for internal navigation. For navigation links that require an "active" state (e.g., in a sidebar), use the custom `<NavLink />` component from `@/components/NavLink.tsx`.

### 6. Backend and Database

*   **Database/Auth**: All interactions with the backend (database, auth, storage) **MUST** go through the pre-configured Supabase client. Import it from `@/integrations/supabase/client.ts`.

### 7. Icons

*   **Icons**: **Exclusively** use icons from the `lucide-react` library. This ensures visual consistency across the application.

### 8. User Feedback

*   **Notifications**: For transient notifications (e.g., "Profile saved successfully," "Error deleting item"), use the `useToast()` hook provided by `shadcn/ui`.