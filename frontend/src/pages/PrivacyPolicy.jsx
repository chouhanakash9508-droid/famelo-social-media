import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-lg font-medium text-white">Account Information</h3>
              <p>When you create an account, we collect your email address, username, and profile information you choose to provide.</p>
              
              <h3 className="text-lg font-medium text-white">Content</h3>
              <p>We collect the content you create, upload, or share on FAMELO, including posts, comments, stories, and messages.</p>
              
              <h3 className="text-lg font-medium text-white">Usage Data</h3>
              <p>We collect information about how you use our service, including interactions, features used, and time spent on the platform.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Provide and maintain our service</li>
              <li>Personalize your experience and content</li>
              <li>Send notifications about activity on your account</li>
              <li>Improve our platform and develop new features</li>
              <li>Ensure security and prevent abuse</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <div className="space-y-4 text-gray-300">
              <p>We do not sell your personal information. We may share information in these situations:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who help us operate FAMELO</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-gray-300">
              We implement appropriate security measures to protect your information against unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Control privacy settings and data sharing</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-300">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
              and provide personalized content. You can control cookie settings through your browser.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
            <p className="text-gray-300">
              FAMELO is not intended for users under 13 years of age. We do not knowingly collect 
              personal information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-900 rounded-lg">
              <p className="text-white">Email: privacy@famelo.com</p>
              <p className="text-white">Address: [Your Company Address]</p>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;