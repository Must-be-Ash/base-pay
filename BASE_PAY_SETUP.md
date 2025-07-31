# Base Pay Integration Setup Guide

## ✅ Integration Complete!

Your AI Image Transformer now has Base Pay integration for pay-per-use functionality ($0.20 per transformation).

## What's Changed

### 🎉 New Features Added
- **Base Pay Button**: Replaces the old transform button
- **Payment Flow**: Users pay $0.20 USDC before transformation
- **Payment Status**: Real-time feedback during payment and processing
- **Payment Verification**: Backend validates payments (optional)
- **Error Handling**: Comprehensive error states and recovery

### 📁 Files Modified
- `app/page.tsx` - Main UI with Base Pay integration
- `app/api/transform/route.ts` - Payment verification added
- `lib/base-account.ts` - Base Account SDK initialization
- `.env` - Base Pay configuration variables
- `package.json` - Base Account dependencies added

## 🔧 Configuration Required

### 1. Update Wallet Address
**IMPORTANT**: Replace the placeholder wallet address in `.env`:

```env
# Replace this placeholder with your actual wallet address
NEXT_PUBLIC_BASE_PAY_RECIPIENT=0x1234567890123456789012345678901234567890
```

### 2. Testnet vs Mainnet
Currently configured for **testnet**. For production:
```env
NEXT_PUBLIC_BASE_PAY_TESTNET=false
```

## 🧪 Testing Instructions

### Setup for Testing
1. **Get Test USDC**: Visit [Circle Faucet](https://faucet.circle.com)
   - Select "Base Sepolia" network
   - Get test USDC to your Base Account

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Test Flow**:
   - Upload an image
   - Enter a transformation prompt
   - Click the Base Pay button (you'll see it instead of the old transform button)
   - Complete payment in Base Account popup
   - Watch transformation proceed automatically

### What to Test
- ✅ Payment cancellation (user closes popup)
- ✅ Invalid image/prompt (payment blocked)
- ✅ Successful payment → transformation
- ✅ Network errors during transformation
- ✅ Multiple transformations in sequence

## 🌟 User Experience

### New User Flow
1. **Landing** → User sees "$0.20 per transformation" pricing
2. **Upload** → User selects image and enters prompt  
3. **Pay Gate** → Base Pay button appears (replaces old transform button)
4. **Payment** → User clicks, Base Account popup, pays $0.20 USDC
5. **Processing** → "Payment successful! Transforming image..."
6. **Result** → Transformed image in modal with download
7. **Next** → "Create Another" resets flow for next transformation

### Key Benefits
- **Instant Payments**: ~2 second settlement on Base
- **No Forms**: Works with any Base Account, no signup needed
- **Global**: USDC works worldwide
- **No Fees**: Base Pay has no additional fees
- **No Chargebacks**: Crypto payments are final

## 🚀 Production Deployment

### Before Going Live
1. **Update wallet address** to your production wallet
2. **Set testnet to false** in environment variables
3. **Test on mainnet** with small amounts first
4. **Monitor initial transactions** for any issues

### Environment Variables for Production
```env
REPLICATE_API_TOKEN=your_production_token
NEXT_PUBLIC_BASE_PAY_RECIPIENT=0xYourProductionWallet
NEXT_PUBLIC_BASE_PAY_TESTNET=false
```

## 📊 Revenue Model

- **$0.20 per transformation** received instantly in USDC
- **No payment processing fees** (Base Pay is free)
- **No gas fees for users** (sponsored by Base Account)
- **No chargebacks** (crypto payments are final)

## 🔍 Monitoring

### Payment Logs
Check your server logs for:
```
Payment {paymentId} verified successfully
Payment {paymentId} processed for transformation: {prompt}...
```

### Analytics to Track
- Payment conversion rates
- Failed payments vs failed transformations  
- Revenue metrics
- Popular transformation prompts

## 🆘 Troubleshooting

### Common Issues
1. **"Payment not completed" error**: Payment verification failed, check testnet setting
2. **"Missing requirements" before payment**: Ensure image and prompt are provided
3. **BasePayButton not showing**: Check environment variables are set
4. **Build errors**: Ensure all dependencies installed correctly

### Support Scenarios
If payment succeeds but transformation fails:
- User gets clear error with payment ID
- Logs contain payment ID for manual resolution
- Consider offering refunds or credits for failed transformations

## 📚 Documentation References

- [Base Pay Documentation](docs/accept-payments.md)
- [Base Account SDK](https://docs.base.org/account)
- [Circle USDC Faucet](https://faucet.circle.com)
- [Base Sepolia Explorer](https://sepolia.basescan.org)

---

**✨ Your app now has pay-per-use functionality with Base Pay! Users can pay $0.20 USDC instantly for each image transformation.**