**yet to complete a lot of things**

This application is a role-based multivendor eCommerce dashboard, built using **Next.js (App Router)** and **MongoDB**. It has two distinct dashboards:

* **Customer Dashboard**: Where customers can browse products and order products.
* **Seller Dashboard**: Where the seller can add, manage, and view their products.

Authentication is handled by **NextAuth** using both **Google** and **credentials** (email/password). Based on the user role (`customer` or `seller`), the user is redirected to their respective dashboard.

### Features I’ve Implemented

#### Authentication & Authorization

* Google and credentials-based login with NextAuth.
* Role-based JWT and session management.
* Restricted access for seller-specific pages.

#### User Roles

* Default users are registered as `customer`.
* Only one predefined email is allowed to be the `seller` for now but anyone can be a seller by filling up a form which I will implement later.

#### Product Management (Seller)

* Overview Page
* Manage Orders 
* 
* Add product form with:
  * Title, description, price, category, brand, features, images, etc.
* Product image upload via **ImgBB API** initially for development but I will implement claudinary later.
* Products are stored in MongoDB with `sellerId` referencing the seller.
* Edit products (manage product details)
* Settings page to edit seller informations like address, payment methods and others.

#### Customer View

* Product listing page showing seller-added products on the main customer route.
* Displays product details and image in product detail page.
* Profile page to manage and update customer informations
* My cart and wishlist functionalities
* Order page to maintain orders
* Support page to mail and contact seller
* Overview page to see recent activities and total order, wishlist and pending deliveries

#### 

### Assumptions Made Due to Incomplete Designs

* Support Section, Products page, Product Details Page in customer section and settings page were custom-designed due to missing Figma components.
* Anyone can be a seller by filling up a form of seller details but initially everyone is customer by default.
* Product schema and input fields were inferred based on typical eCommerce platforms.
* Cart, wishlist and Order systems ar included.

---

### Challenges Faced During Development

* **NextAuth in App Router**: Required learning how to use `SessionProvider` properly in the new layout structure.
* **Session Role Management**: Needed to extend `session.user` and `token` types to include `role` and `id` safely.
* **Server Component Limits**: Using `useSession` inside server components caused errors. Had to ensure session handling was done in client components only.
* **ImgBB Upload**: Some file size limitations caused `413 Payload Too Large` errors.
* **Database Errors**: Accidentally inserting product documents into the `users` collection due to incorrect model usage.

