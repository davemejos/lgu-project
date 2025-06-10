# LGU Project App - Coding Standards Summary

## 🎯 **Enterprise-Grade Standards Overview**

This document provides a quick reference to the comprehensive coding standards established for the LGU Project App to ensure **robust**, **clean**, and **professional** engineering practices.

---

## 🔥 **MANDATORY REQUIREMENTS**

### **✅ Zero Tolerance Standards:**
- **ESLint:** `npx next lint` - MUST return zero warnings/errors
- **TypeScript:** `npx tsc --noEmit` - MUST return zero type errors
- **Build:** `npm run build` - MUST complete successfully
- **Tests:** 80%+ code coverage required
- **Accessibility:** WCAG 2.1 AA compliance mandatory

---

## 🔷 **TypeScript Standards**

### **NEVER USE:**
```typescript
❌ any                    // Use proper types
❌ object                 // Use specific interfaces
❌ Function               // Use proper function types
```

### **ALWAYS USE:**
```typescript
✅ interface Personnel { id: number; name: string }
✅ type Status = 'Active' | 'Inactive' | 'On Leave'
✅ const getData = async (): Promise<Personnel[]> => {}
✅ Record<string, unknown>  // Instead of any
```

---

## ⚛️ **React/Next.js Standards**

### **Component Structure:**
```typescript
✅ interface Props { personnel: Personnel; onEdit: (p: Personnel) => void }
✅ const Component: React.FC<Props> = ({ personnel, onEdit }) => {}
✅ export default Component
```

### **Hooks Optimization:**
```typescript
✅ const callback = useCallback(() => {}, [dependency])
✅ const value = useMemo(() => expensive(), [data])
✅ useEffect(() => {}, [allDependencies])  // Include ALL deps
```

---

## 🔍 **Code Quality Standards**

### **Naming Conventions:**
```typescript
✅ PascalCase:     PersonnelCard, UserModal
✅ camelCase:      handleSubmit, userData
✅ SCREAMING_CASE: MAX_UPLOAD_SIZE, API_ENDPOINTS
✅ kebab-case:     file-name.utils.ts
```

### **Import Organization:**
```typescript
// 1. React/Next.js
import { useState } from 'react'
// 2. Third-party
import { Plus } from 'lucide-react'
// 3. Components
import PersonnelCard from '@/components/PersonnelCard'
// 4. Types
import type { Personnel } from '@/types/personnel'
// 5. Utils
import { DatabaseService } from '@/lib/database'
```

---

## 🗄️ **API & Database Standards**

### **API Route Structure:**
```typescript
✅ export async function GET(request: NextRequest) {
  try {
    const result = await DatabaseService.getData()
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### **Error Handling:**
```typescript
✅ try/catch for all async operations
✅ Specific error types (ValidationError, DatabaseError)
✅ Proper HTTP status codes
✅ Consistent error response format
```

---

## 🎨 **UI/UX Standards**

### **Accessibility (MANDATORY):**
```tsx
✅ <button aria-label="Edit personnel">
✅ <main role="main">
✅ <h1 id="heading">Title</h1>
✅ tabIndex={0} onKeyDown={handleKeyboard}
```

### **Responsive Design:**
```tsx
✅ className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
✅ className="text-sm md:text-base lg:text-lg"
✅ Mobile-first approach
```

---

## 🧪 **Testing Standards**

### **Unit Tests (MANDATORY):**
```typescript
✅ describe('Component', () => {
  it('should render correctly', () => {
    render(<Component {...props} />)
    expect(screen.getByText('Expected')).toBeInTheDocument()
  })
})
```

### **API Tests:**
```typescript
✅ Test all endpoints
✅ Test error scenarios
✅ Test validation
✅ Test authentication
```

---

## 🔒 **Security Standards**

### **Input Validation (MANDATORY):**
```typescript
✅ const schema = z.object({ name: z.string().min(1).max(100) })
✅ const validated = schema.parse(input)
✅ Sanitize all outputs
✅ Use parameterized queries
```

### **Authentication:**
```typescript
✅ Protect all API routes
✅ Validate sessions
✅ Check permissions
✅ Handle unauthorized access
```

---

## ⚡ **Performance Standards**

### **React Optimization:**
```typescript
✅ React.memo for components
✅ useCallback for event handlers
✅ useMemo for expensive calculations
✅ Dynamic imports for large components
```

### **Database Optimization:**
```typescript
✅ Use pagination for large datasets
✅ Implement proper indexing
✅ Optimize queries
✅ Use connection pooling
```

---

## 📖 **Documentation Standards**

### **JSDoc (MANDATORY):**
```typescript
/**
 * Retrieves paginated personnel data
 * @param page - Page number (1-based)
 * @param limit - Items per page (max 100)
 * @returns Promise resolving to paginated data
 * @throws {ValidationError} When parameters are invalid
 */
```

### **README Requirements:**
```markdown
✅ Purpose and description
✅ Props/parameters table
✅ Usage examples
✅ Accessibility notes
```

---

## 🚀 **Enforcement Checklist**

### **Before Every Commit:**
- [ ] `npx next lint` - Zero warnings/errors
- [ ] `npx tsc --noEmit` - Zero type errors
- [ ] `npm run test` - All tests pass
- [ ] `npm run build` - Successful build
- [ ] Accessibility check - ARIA labels added
- [ ] Performance check - No unnecessary re-renders

### **AI Assistant Compliance:**
- [ ] Never use `any` type
- [ ] Always add accessibility features
- [ ] Always handle errors properly
- [ ] Always optimize performance
- [ ] Always validate inputs
- [ ] Always document complex code
- [ ] Always follow file structure
- [ ] Always run quality checks

---

## 🎖️ **Quality Gates**

### **Automated Checks:**
```bash
✅ ESLint: 0 errors, 0 warnings
✅ TypeScript: 0 type errors
✅ Tests: 80%+ coverage
✅ Build: Successful
✅ Security: 0 vulnerabilities
✅ Performance: Lighthouse 90+
```

### **Manual Reviews:**
```bash
✅ Code review approval required
✅ Architecture review for major changes
✅ Security review for auth changes
✅ Performance review for optimization
```

---

## 🏆 **ENTERPRISE COMMITMENT**

### **Zero Tolerance Policy:**
- 🚫 **No `any` types** - Proper TypeScript required
- 🚫 **No accessibility violations** - WCAG compliance mandatory
- 🚫 **No security vulnerabilities** - Validation required
- 🚫 **No performance regressions** - Optimization required
- 🚫 **No undocumented code** - Documentation mandatory
- 🚫 **No untested code** - Test coverage required

### **Quality Guarantee:**
> "Every line of code meets enterprise-grade standards for reliability, security, performance, and maintainability."

---

## ✅ **FINAL STATUS: MANDATORY COMPLIANCE**

**ALL DEVELOPERS AND AI ASSISTANTS MUST FOLLOW THESE STANDARDS.**

**Non-compliance results in:**
- ❌ Code rejection
- ❌ Build failure
- ❌ Deployment block
- ❌ Rework required

**Compliance ensures:**
- ✅ Enterprise-grade quality
- ✅ Robust and secure system
- ✅ Scalable architecture
- ✅ Maintainable codebase

**EXCELLENCE IS EXPECTED. ENTERPRISE-GRADE QUALITY IS DELIVERED.** 🎯
