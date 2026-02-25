# Backend 400 Error - Fix Documentation

## Problem
When creating a stool test, the backend was returning a `400 Bad Request` error with the message:
```
"property createdById should not exist"
```

## Root Cause
The backend's `CreateStoolTestDto` class was rejecting the `createdById` field because:
1. The field was not marked as `@IsOptional()` in the DTO validation
2. The backend might be using class-validator with settings that reject unknown or undefined properties
3. OR the field validation was stricter than expected

## Solution Implemented

### Frontend Changes

#### 1. **stool-test-form.component.ts** - Conditional Field Assignment
```typescript
// Only include createdById if the user is authenticated
if (currentUser?.id) {
  createDto.createdById = currentUser.id;
}
```
- This ensures `createdById` is only included in the payload when it has a value
- Prevents sending `undefined` values

#### 2. **stool-test.service.ts** - Payload Cleaning
```typescript
// Filter out undefined properties to avoid backend validation issues
const cleanedData = Object.fromEntries(
  Object.entries(data).filter(([_, value]) => value !== undefined)
) as CreateStoolTestDto;
```
- Removes all `undefined` properties from the payload
- Sends a clean object with only defined values
- Applied to both `createStoolTest()` and `updateStoolTest()` methods

### Expected Behavior

#### Before Fix:
```json
{
  "patientId": "123",
  "color": undefined,
  "consistency": undefined,
  "createdById": "user-id",
  ...other undefined fields...
}
```
Result: 400 Bad Request

#### After Fix:
```json
{
  "patientId": "123",
  "createdById": "user-id"
}
```
Result: 200 OK (only defined fields sent)

## Console Logging

The fix includes enhanced logging:

```typescript
// In stool-test.service.ts
console.log('📤 FRONTEND - Objeto enviado al backend (CreateStoolTestDto):', {
  payload: data,  // Original payload
  timestamp: new Date().toISOString()
});

console.log('📤 FRONTEND - Objeto limpio sin undefined:', {
  payload: cleanedData,  // After filtering undefined
  timestamp: new Date().toISOString()
});
```

This allows you to see:
1. What the component is preparing to send
2. What actually gets sent to the backend

## Error Handling

Enhanced error message display in the form component:
```typescript
if (Array.isArray(error.error.message)) {
  this.errorMessage = error.error.message.join(', ');
} else {
  this.errorMessage = error.error.message;
}
```

This properly displays validation error arrays from the backend.

## Backend Requirements

The backend `CreateStoolTestDto` should be configured as:

```typescript
export class CreateStoolTestDto {
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsEnum(TestStatus)
  status?: TestStatus;

  @IsOptional()
  @IsString()
  color?: string;

  // ... other fields ...

  @IsOptional()
  @IsUUID()
  createdById?: string;  // Must be optional!
}
```

**Key Requirements:**
- ✅ `createdById` must have `@IsOptional()` decorator
- ✅ Optional fields should use `?` in TypeScript
- ✅ Avoid `skipMissingProperties: true` on `@ValidateNested()` if it causes issues
- ✅ Consider using `@Transform()` to clean undefined values on backend too

## Testing Steps

1. **Create a stool test with user:**
   - Check console for "Objeto CreateStoolTestDto construido"
   - Check console for "Objeto limpio sin undefined"
   - Verify `createdById` is in the cleaned payload
   - Should get 200 OK response

2. **Check response contains user relationship:**
   - Verify response includes `createdBy` object or `createdById`
   - Backend should populate the relationship

3. **Update a stool test:**
   - Same process applies to `updateStoolTest()`
   - Should see `reviewedById` in the cleaned payload
   - Response should include `reviewedBy` relationship

## Files Modified

1. `src/app/components/stool-tests/stool-test-form.component.ts`
   - Conditional assignment of `createdById`
   - Enhanced error message handling

2. `src/app/services/stool-test.service.ts`
   - Added payload cleaning logic to both create and update methods
   - Enhanced logging with "clean" payload

## Related Issues

- **Issue**: Backend throws validation error for optional fields
- **Cause**: Too-strict DTO validation or `skipMissingProperties` setting
- **Workaround**: Filter undefined values before sending
- **Permanent Fix**: Update backend DTO validation rules

## Next Steps

1. Test with the updated frontend code
2. If still getting 400 error, check backend logs for exact validation message
3. Backend team should ensure DTOs allow optional fields
4. Consider adding a custom HttpInterceptor to clean payloads globally (future enhancement)
