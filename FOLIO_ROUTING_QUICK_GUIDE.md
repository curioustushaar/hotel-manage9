# Folio Routing - Quick Reference Guide

## 🎯 What is Folio Routing?

Folio Routing allows you to **move charges** from one folio/room to another within the same booking. This is useful when:
- Guest requests charges to be billed to a different room
- Company booking needs to consolidate charges
- Splitting bills between multiple folios
- Correcting charges posted to wrong folio

## 🚀 How to Route Charges

### Step 1: Navigate to Folio Operations
```
Booking Details → Folio Operations Tab → Folio Operations Button
```

### Step 2: Click "Folio Routing"
Opens the Route Folio Sidebar

### Step 3: Select Transactions
- ☑️ Click individual transactions to select
- ☑️ OR click "Select All" to select everything
- 💰 See total amount at bottom

### Step 4: Choose Target Folio
- Select destination folio from dropdown
- Only shows other folios (not current one)

### Step 5: Route Charges
- Click "Route Charges" button
- Review confirmation message
- Click "Confirm" to complete

### Step 6: Verify
- ✓ Charges moved to target folio
- ✓ View automatically switches to target folio
- ✓ Success message appears

## 📋 Important Rules

| Rule | Description |
|------|-------------|
| ✅ **Only Charges** | Only positive charges can be routed (not payments) |
| ⛔ **Same Folio** | Cannot route to same folio |
| 🔒 **Permanent** | Routing is permanent (cannot undo via UI) |
| 📝 **Tracked** | All routing operations are logged |
| 💳 **Payments Stay** | Payments remain in original folio |

## 🎨 UI Elements Explained

### Transaction Card
```
☑️ [Checkbox]
   Laundry                              ₹ 1200
   Sat, 07/02/2026 | laundry - Qty: 100
```

### Summary Box (Green)
```
Selected Transactions: 3
Total Amount: ₹ 3,500
```

### Confirmation Modal
```
┌────────────────────────────────────┐
│ Confirm Folio Routing         [×]  │
├────────────────────────────────────┤
│ Are you sure you want to route     │
│ 3 charge(s) to Deluxe-102?         │
│                                     │
│           [Cancel] [Route Charges] │
└────────────────────────────────────┘
```

## 💡 Pro Tips

1. **Review Before Routing**
   - Always check selected transactions
   - Verify target folio is correct
   - Check total amount matches expectation

2. **Use Select All Carefully**
   - Select All includes ALL charges in current folio
   - Deselect any you don't want to route

3. **Check After Routing**
   - System auto-switches to target folio
   - Verify transactions appear there
   - Document routing for records

4. **Payment Handling**
   - Payments cannot be routed
   - Apply payments to correct folio initially
   - Or add new payment to target folio

## ❗ Common Scenarios

### Scenario 1: Company Booking
**Problem:** Room 101, 102, 103 are company booking. All charges should go to Room 101.

**Solution:**
1. Open Room 102 folio
2. Route all charges to Room 101
3. Open Room 103 folio
4. Route all charges to Room 101
5. Room 101 now has all charges

### Scenario 2: Split Bill
**Problem:** Couple in Room 201. Each wants to pay their own charges.

**Solution:**
1. Create second folio (Folio B) for same booking
2. Route selected charges to Folio B
3. Each folio can be billed separately

### Scenario 3: Wrong Folio Posting
**Problem:** Laundry was posted to Room 305 but belongs to Room 306.

**Solution:**
1. Open Room 305 folio
2. Select the Laundry charge
3. Route to Room 306
4. Charge now appears in Room 306

### Scenario 4: VIP Guest
**Problem:** VIP in Room 401 wants all bar charges from Room 402 (assistant's room).

**Solution:**
1. Open Room 402 folio
2. Select only Bar charges
3. Route to Room 401
4. Bar charges now in VIP's folio

## 🔍 Verification Checklist

After routing, verify:
- [ ] Selected charges no longer in source folio
- [ ] Selected charges appear in target folio
- [ ] Charge amounts are correct
- [ ] Source folio total updated
- [ ] Target folio total updated
- [ ] Transaction dates preserved
- [ ] Transaction descriptions intact

## 🆘 Troubleshooting

### Problem: No transactions showing
**Cause:** Current folio has no charges
**Solution:** Add charges first, or switch to different folio

### Problem: Route Charges button disabled
**Cause:** No transactions selected or no target folio chosen
**Solution:** Select at least one transaction AND choose target folio

### Problem: "Source and target cannot be same" error
**Cause:** Trying to route to same folio
**Solution:** Choose a different target folio

### Problem: Transactions still showing after refresh
**Cause:** Browser cache
**Solution:** Hard refresh (Ctrl+Shift+R) or clear cache

## 📊 Reporting

After routing, you can:
- View routed transactions in target folio
- Check routing metadata in database
- Generate reports showing routing history
- Audit who routed what and when

## 🔐 Security & Audit

Every routing operation records:
- **Who** performed the routing (routedBy)
- **When** it was done (routedAt)
- **From** which folio (routedFrom)
- **To** which folio (routedTo)

This creates a complete audit trail for accounting and compliance.

## 📱 Mobile Support

The Route Folio Sidebar is responsive and works on:
- Tablets (768px+)
- Small tablets in landscape
- Desktop browsers

*Note: Very small mobile screens may have limited functionality.*

## ⚡ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Close sidebar |
| `Enter` | Submit form (when focused) |
| `Tab` | Navigate between elements |
| `Space` | Toggle checkbox (when focused) |

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review Implementation Documentation
3. Check browser console for errors
4. Contact IT support with booking ID and error details

---

**Quick Start:** Folio Operations → Folio Routing → Select Charges → Choose Target → Confirm

**Remember:** Routing is permanent. Double-check before confirming!
