import { HelpCircle, Mail, Phone, MapPin } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-950">About Graceonix</h1>
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>Welcome to Graceonix — your destination for stylish, comfortable, and quality T-shirts made for everyday wear.</p>
        <p>At Graceonix, we believe fashion should be simple, affordable, and expressive. Our goal is to bring modern designs and premium-quality apparel that fit your style and your lifestyle.</p>
        <p>Every collection is selected with attention to comfort, fabric quality, and design so you can wear your favorites with confidence — whether you're going out, relaxing, or creating your own style statement.</p>
        
        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">What We Offer</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Premium Quality T-Shirts</li>
          <li>Trendy & Minimal Designs</li>
          <li>Comfortable Everyday Wear</li>
          <li>Secure Online Shopping</li>
          <li>Fast Order Processing</li>
          <li>Customer-Focused Support</li>
        </ul>
        
        <p className="pt-4">We are committed to delivering products that combine style, quality, and value.</p>
        <p>Thank you for choosing Graceonix — wear your style with confidence.</p>
        <p className="font-semibold text-gray-900 pt-2">Graceonix – Wear Your Style.</p>
      </div>
    </div>
  );
}

export function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-950">Contact Us</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 p-6 rounded-xl text-center shadow-xxs space-y-3">
          <Mail className="h-6 w-6 text-purple-600 mx-auto" />
          <h3 className="text-sm font-semibold">Email</h3>
          <p className="text-xs text-gray-500">support@graceonix.local</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-xl text-center shadow-xxs space-y-3">
          <Phone className="h-6 w-6 text-purple-600 mx-auto" />
          <h3 className="text-sm font-semibold">Phone</h3>
          <p className="text-xs text-gray-500">+91 98765 43210</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-xl text-center shadow-xxs space-y-3">
          <MapPin className="h-6 w-6 text-purple-600 mx-auto" />
          <h3 className="text-sm font-semibold">Address</h3>
          <p className="text-xs text-gray-500">Bangalore, Karnataka, India</p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const faqs = [
    { q: 'How does Razorpay payment work?', a: 'This store is integrated with Razorpay in Test Mode. You can use standard Razorpay mock credentials to checkout.' },
    { q: 'Is there a shipping charge?', a: 'Free delivery applies to all orders above ₹999. A shipping fee of ₹99 is charged on orders under ₹999.' },
    { q: 'What is the refund policy?', a: 'We offer hassle-free returns within 14 days of order delivery for a full refund.' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-950">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white border border-gray-100 p-5 rounded-xl shadow-xxs space-y-2">
            <h3 className="font-semibold text-sm text-gray-900 flex items-start">
              <HelpCircle className="h-4 w-4 mr-2 text-purple-600 shrink-0 mt-0.5" />
              {faq.q}
            </h3>
            <p className="text-xs text-gray-600 pl-6 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Legal() {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Legal Policy';
  let content = null;

  if (path === '/privacy') {
    title = 'Privacy Policy';
    content = (
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>At Graceonix, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, place an order, or contact customer support. This may include your name, email address, shipping address, and payment information.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">2. How We Use Your Information</h2>
        <p>We use your information to process and fulfill your orders, communicate with you about your purchases, and improve our services. We may also use it to send you promotional offers if you have opted in to receive them.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">3. Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using secure socket layer technology (SSL).</p>
      </div>
    );
  } else if (path === '/terms') {
    title = 'Terms of Service';
    content = (
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>Welcome to Graceonix. By accessing or using our website, you agree to be bound by these Terms of Service.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">1. Use of the Site</h2>
        <p>You may use our website for lawful purposes only. You must not use our site to engage in any fraudulent activity, distribute viruses, or violate the rights of others.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">2. Product Information</h2>
        <p>We strive to display our products accurately, but we do not guarantee that the colors or descriptions are completely error-free. Prices and availability are subject to change without notice.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">3. Intellectual Property</h2>
        <p>All content on this site, including text, graphics, logos, and images, is the property of Graceonix and is protected by copyright laws.</p>
      </div>
    );
  } else if (path === '/shipping') {
    title = 'Shipping & Delivery';
    content = (
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>We are dedicated to delivering your Graceonix apparel to you as quickly and securely as possible.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">1. Processing Time</h2>
        <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">2. Shipping Rates & Delivery Estimates</h2>
        <p>Shipping charges for your order will be calculated and displayed at checkout. We offer standard shipping (3-5 business days) and expedited shipping (1-2 business days) options.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">3. Order Tracking</h2>
        <p>Once your order has shipped, you will receive a confirmation email containing your tracking number(s). The tracking number will be active within 24 hours.</p>
      </div>
    );
  } else if (path === '/returns') {
    title = 'Returns & Refunds';
    content = (
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>We want you to be completely satisfied with your purchase. If you're not happy with your item, we're here to help.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">1. Returns</h2>
        <p>You have 14 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused, unwashed, and in the same condition that you received it.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">2. Refunds</h2>
        <p>Once we receive your item, we will inspect it and notify you of the status of your refund. If approved, we will initiate a refund to your original method of payment.</p>
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">3. Shipping Returns</h2>
        <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-950">{title}</h1>
      <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-xxs">
        {content}
      </div>
    </div>
  );
}
