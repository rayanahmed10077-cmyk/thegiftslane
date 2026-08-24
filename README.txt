# The Gifts Lane V7

A polished e-commerce storefront inspired by the clean structure and shopping flow of modern Indian D2C stores such as BeYou, while using original The Gifts Lane branding/content.

Features:
- responsive storefront
- categories and product search
- 12 products with prices
- cart + checkout
- UPI QR/payment link using 7019445211@ybl
- UTR submission
- Supabase order APIs
- Vercel configuration

Important:
- Keep SUPABASE_SERVICE_ROLE_KEY server-side only.
- Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables.
- The UPI flow is manual verification: customers submit their UTR and the merchant verifies the payment before marking the order paid.

To publish:
1. Upload this folder to a GitHub repository.
2. Import the repository into Vercel.
3. Add the required environment variables.
4. Deploy.
