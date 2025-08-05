<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Copilot Instructions for Expense Tracker PWA

## Project Overview
This is a Progressive Web App (PWA) for personal expense management built with Next.js 14, TypeScript, and Tailwind CSS. The app works offline and can be installed on mobile devices like a native app.

## Key Technologies
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS  
- **State Management**: React Hooks + localStorage
- **PWA**: Service Worker, Web App Manifest
- **Icons**: Lucide React
- **Data Storage**: localStorage (client-side only)

## Code Style Guidelines
- Use functional components with hooks
- Prefer TypeScript interfaces over types
- Use Tailwind CSS classes for styling
- Follow mobile-first responsive design
- Implement proper error handling
- Use descriptive variable and function names in Vietnamese when appropriate

## Architecture Patterns
- **Components**: Place reusable UI components in `src/components/ui/`
- **Business Logic**: Keep business logic in custom hooks (`src/hooks/`)
- **Data Layer**: Use storage service for all localStorage operations
- **Utils**: Place helper functions in `src/lib/utils.ts`
- **Types**: Define all TypeScript types in `src/types/`

## PWA Considerations
- Ensure all features work offline
- Optimize for mobile touch interactions
- Implement proper loading states
- Use appropriate meta tags for mobile browsers
- Consider iOS Safari PWA limitations

## Vietnamese Language
- Use Vietnamese for user-facing text and messages
- Keep code comments and variable names in English for technical clarity
- Error messages and UI text should be in Vietnamese

## Performance
- Minimize bundle size
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets for mobile

## Accessibility
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation works
- Maintain good color contrast ratios

When implementing new features or fixing bugs, consider the mobile-first nature of this PWA and ensure everything works well on touch devices.
