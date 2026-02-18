import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By accessing and using FAMELO, you accept and agree to be bound by the terms and provision 
              of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-gray-300">
              FAMELO is a social media platform that allows users to share photos, videos, stories, 
              and connect with others. We provide tools for content creation, discovery, and social interaction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <div className="space-y-4 text-gray-300">
              <p>To use FAMELO, you must:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Be at least 13 years old</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Be responsible for all activity under your account</li>
                <li>Not create multiple accounts or impersonate others</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Content Guidelines</h2>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-lg font-medium text-white">Prohibited Content</h3>
              <p>You may not post content that:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Is illegal, harmful, or violates others' rights</li>
                <li>Contains hate speech, harassment, or bullying</li>
                <li>Is sexually explicit or contains nudity</li>
                <li>Promotes violence or dangerous activities</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains spam or misleading information</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">Content Ownership</h3>
              <p>You retain ownership of content you post, but grant FAMELO a license to use, display, and distribute your content on our platform.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. User Conduct</h2>
            <div className="space-y-4 text-gray-300">
              <p>You agree to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Use FAMELO in compliance with all applicable laws</li>
                <li>Respect other users and their content</li>
                <li>Not engage in harassment or abusive behavior</li>
                <li>Not attempt to hack or disrupt our service</li>
                <li>Not use automated tools to access our platform</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Privacy</h2>
            <p className="text-gray-300">
              Your privacy is important to us. Please review our Privacy Policy to understand 
              how we collect, use, and protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="text-gray-300">
              FAMELO and its original content, features, and functionality are owned by us and are 
              protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
            <div className="space-y-4 text-gray-300">
              <p>We may terminate or suspend your account if you:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Violate these Terms of Service</li>
                <li>Engage in prohibited activities</li>
                <li>Harm other users or our platform</li>
              </ul>
              <p>You may delete your account at any time through your account settings.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimers</h2>
            <p className="text-gray-300">
              FAMELO is provided "as is" without warranties of any kind. We do not guarantee 
              uninterrupted access or error-free operation of our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-300">
              We shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use of FAMELO.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these terms at any time. We will notify users 
              of significant changes and continued use constitutes acceptance of new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
            <p className="text-gray-300">
              If you have questions about these Terms of Service, contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-900 rounded-lg">
              <p className="text-white">Email: legal@famelo.com</p>
              <p className="text-white">Address: [Your Company Address]</p>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsOfService;