import React from 'react';
import { Headphones, Mail, MessageSquare, Phone } from 'lucide-react';

const Support = () => {
  return (
    <div className="mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Customer Support</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Contact Methods */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Phone className="w-5 h-5 mt-1 text-primary" />
              <div>
                <h3 className="font-medium">Phone Support</h3>
                <p className="text-gray-600">
                  <a href="tel:+8801990370042" className="hover:underline">
                    +880 1990-370042
                  </a>
                </p>
                <p className="text-sm text-gray-500">Monday-Friday, 9am-5pm EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 mt-1 text-primary" />
              <div>
                <h3 className="font-medium">Email Us</h3>
                <p className="text-gray-600">support@gmail.com</p>
                <p className="text-sm text-gray-500">Typically responds within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MessageSquare className="w-5 h-5 mt-1 text-primary" />
              <div>
                <h3 className="font-medium">Live Chat</h3>
                <p className="text-gray-600">Available on our website</p>
                <p className="text-sm text-gray-500">Monday-Friday, 8am-6pm EST</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">How do I track my order?</h3>
              <p className="text-gray-600 text-sm">
                You can track your order by logging into your account and viewing the order details.
              </p>
            </div>

            <div>
              <h3 className="font-medium">What is your return policy?</h3>
              <p className="text-gray-600 text-sm">
                We accept returns within 30 days of purchase. Items must be unused and in original packaging.
              </p>
            </div>

            <div>
              <h3 className="font-medium">How do I change my account information?</h3>
              <p className="text-gray-600 text-sm">
                You can update your account details in the &quot;Settings&quot; section of your profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Resources */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Help Resources</h2>
        
        <div className="grid sm:grid-cols-3 gap-4 cursor-pointer">
          <div className="flex flex-col items-center text-center p-4 hover:bg-gray-50 rounded transition">
            <Headphones className="w-8 h-8 mb-2 text-primary" />
            <h3 className="font-medium">Help Center</h3>
            <p className="text-gray-600 text-sm">
              Comprehensive guides and tutorials
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 hover:bg-gray-50 rounded transition">
            <MessageSquare className="w-8 h-8 mb-2 text-primary" />
            <h3 className="font-medium">Community Forum</h3>
            <p className="text-gray-600 text-sm">
              Get help from other customers
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 hover:bg-gray-50 rounded transition">
            <Mail className="w-8 h-8 mb-2 text-primary" />
            <h3 className="font-medium">Contact Form</h3>
            <p className="text-gray-600 text-sm">
              Send us a message directly
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-2">
          Was this helpful? Let us know how we can improve.
        </p>
        <button className="px-4 py-2 bg-secondary text-white rounded hover:bg-primary-dark transition">
          Provide Feedback
        </button>
      </div>
    </div>
  );
};

export default Support;