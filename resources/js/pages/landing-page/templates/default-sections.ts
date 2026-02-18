export const defaultLandingPageSections = {
  sections: [
    {
      key: 'header',
      transparent: false,
      background_color: '#ffffff',
      text_color: '#1f2937',
      button_style: 'gradient'
    },
    {
      key: 'hero',
      title: 'Complete Legal Case Management Solution',
      subtitle: 'Streamline your law firm operations with comprehensive case, client, and document management.',
      announcement_text: '⚖️ New: Advanced Court Calendar Integration',
      primary_button_text: 'Start Free Trial',
      secondary_button_text: 'Login',
      image: '',
      background_color: '#f8fafc',
      text_color: '#1f2937',
      layout: 'image-right',
      height: 600,
      stats: [
        { value: '500+', label: 'Law Firms' },
        { value: '25+', label: 'Countries' },
        { value: '98%', label: 'Client Satisfaction' }
      ],
      card: {
        name: 'Sarah Mitchell',
        title: 'Senior Partner',
        company: 'Mitchell & Associates',
        initials: 'SM'
      }
    },
    {
      key: 'features',
      title: 'Comprehensive Legal Practice Management',
      description: 'Everything you need to manage cases, clients, and legal operations efficiently.',
      background_color: '#ffffff',
      layout: 'grid',
      columns: 3,
      image: '',
      show_icons: true,
      features_list: [
        {
          title: 'Case Management',
          description: 'Organize and track all your legal cases in one place.',
          icon: 'briefcase'
        },
        {
          title: 'Client Portal',
          description: 'Secure client communication and document sharing.',
          icon: 'users'
        },
        {
          title: 'Time Tracking & Billing',
          description: 'Automated time tracking with integrated billing system.',
          icon: 'clock'
        }
      ]
    },
    {
      key: 'screenshots',
      title: 'See Advocate in Action',
      subtitle: 'Explore our intuitive interface designed to streamline your legal practice operations.',
      screenshots_list: [
        {
          src: '/screenshots/a-advocate-saas-pic.png',
          alt: 'Legal Case Management Dashboard',
          title: 'Case Management Dashboard',
          description: 'Complete overview of all your legal cases, deadlines, and case progress'
        },
        {
          src: '/screenshots/client-advocate-saas-pic.png',
          alt: 'Client Management System',
          title: 'Client Management',
          description: 'Comprehensive client database with contact information and case history'
        },
        {
          src: '/screenshots/g-advocate-saas-pic.png',
          alt: 'Legal Invoice Management',
          title: 'Invoice Management',
          description: 'Professional invoice generation and billing management for legal services'
        },
        {
          src: '/screenshots/i-advocate-saas-pic.png',
          alt: 'Legal Time Tracking',
          title: 'Time Tracking',
          description: 'Precise time tracking for billable hours with automated invoice generation'
        },
        {
          src: '/screenshots/calendar-advocate-saas-pic.png',
          alt: 'Legal Calendar Management',
          title: 'Calendar & Scheduling',
          description: 'Manage court dates, client meetings, and important deadlines in one integrated calendar'
        }
      ]
    },
    {
      key: 'why_choose_us',
      title: 'Why Choose Advocate?',
      subtitle: 'We\'re the trusted legal practice management solution.',
      reasons: [
        { title: 'Quick Implementation', description: 'Get your law firm up and running in under 24 hours.', icon: 'clock' },
        { title: 'Legal Expertise', description: 'Built by legal professionals for legal professionals.', icon: 'users' }
      ],
      stats: [
        { value: '500+', label: 'Law Firms', color: 'blue' },
        { value: '98%', label: 'Client Satisfaction', color: 'green' }
      ]
    },
    // {
    //   key: 'templates',
    //   title: 'Explore Our Templates',
    //   subtitle: 'Choose from our professionally designed templates to create your perfect digital business card.',
    //   background_color: '#f8fafc',
    //   layout: 'grid',
    //   columns: 3,
    //   templates_list: [
    //     { name: 'freelancer', category: 'professional' },
    //     { name: 'doctor', category: 'medical' },
    //     { name: 'restaurant', category: 'food' },
    //     { name: 'realestate', category: 'business' },
    //     { name: 'fitness', category: 'health' },
    //     { name: 'photography', category: 'creative' },
    //     { name: 'lawfirm', category: 'professional' },
    //     { name: 'cafe', category: 'food' },
    //     { name: 'salon', category: 'beauty' },
    //     { name: 'construction', category: 'business' },
    //     { name: 'eventplanner', category: 'services' },
    //     { name: 'tech-startup', category: 'technology' }
    //   ],
    //   cta_text: 'View All Templates',
    //   cta_link: '#'
    // },
    {
      key: 'about',
      title: 'About Advocate',
      description: 'We are passionate about transforming legal practice management.',
      story_title: 'Empowering Legal Professionals Since 2020',
      story_content: 'Founded by legal professionals and technology experts, Advocate was born from the need for efficient legal practice management.',
      image: '',
      background_color: '#f9fafb',
      layout: 'image-right',
      stats: [
        { value: '4+ Years', label: 'Experience', color: 'blue' },
        { value: '500+', label: 'Law Firms', color: 'green' },
        { value: '25+', label: 'Countries', color: 'purple' }
      ]
    },
    {
      key: 'team',
      title: 'Meet Our Team',
      subtitle: 'We\'re a diverse team of innovators and problem-solvers.',
      cta_title: 'Want to Join Our Team?',
      cta_description: 'We\'re always looking for talented individuals.',
      cta_button_text: 'View Open Positions',
      members: [
        { name: 'Sarah Johnson', role: 'CEO & Founder', bio: 'Former legal tech executive with 15+ years experience.', image: '', linkedin: '#', email: 'sarah@advocate.com' }
      ]
    },
    {
      key: 'testimonials',
      title: 'What Our Clients Say',
      subtitle: 'Don\'t just take our word for it.',
      trust_title: 'Trusted by Law Firms Worldwide',
      trust_stats: [
        { value: '4.9/5', label: 'Average Rating', color: 'blue' },
        { value: '500+', label: 'Law Firms', color: 'green' }
      ],
      testimonials: [
        { name: 'Michael Rodriguez', role: 'Managing Partner', company: 'Rodriguez Law Group', content: 'Advocate has transformed our legal practice operations completely.', rating: 5 }
      ]
    },
    {
      key: 'plans',
      title: 'Choose Your Plan',
      subtitle: 'Start with our free plan and upgrade as you grow.',
      faq_text: 'Have questions about our plans? Contact our sales team'
    },
    {
      key: 'faq',
      title: 'Frequently Asked Questions',
      subtitle: 'Got questions? We\'ve got answers.',
      cta_text: 'Still have questions?',
      button_text: 'Contact Support',
      faqs: [
        { question: 'How does Advocate help law firms?', answer: 'Advocate provides comprehensive case management, client billing, document management, and legal research tools in one platform.' }
      ]
    },
    {
      key: 'newsletter',
      title: 'Stay Updated with Advocate',
      subtitle: 'Get the latest legal tech updates and practice management tips.',
      privacy_text: 'No spam, unsubscribe at any time.',
      benefits: [
        { icon: '⚖️', title: 'Legal Tech Updates', description: 'Latest legal technology features and improvements' }
      ]
    },
    {
      key: 'contact',
      title: 'Get in Touch',
      subtitle: 'Have questions about Advocate? We\'d love to hear from you.',
      form_title: 'Send us a Message',
      info_title: 'Contact Information',
      info_description: 'We\'re here to help and answer any question you might have.',
      layout: 'split',
      background_color: '#f9fafb'
    },
    {
      key: 'footer',
      description: 'Transforming legal practice management with innovative technology solutions.',
      newsletter_title: 'Stay Updated',
      newsletter_subtitle: 'Join our newsletter for updates',
      links: {
        product: [{ name: 'Features', href: '#features' }, { name: 'Pricing', href: '#pricing' }],
        company: [{ name: 'About Us', href: '#about' }, { name: 'Contact', href: '#contact' }]
      },
      social_links: [
        { name: 'Facebook', icon: 'Facebook', href: '#' },
        { name: 'Twitter', icon: 'Twitter', href: '#' }
      ],
      section_titles: {
        product: 'Product',
        company: 'Company'
      }
    }
  ],
  theme: {
    primary_color: '#10b981',
    secondary_color: '#ffffff',
    accent_color: '#f7f7f7',
    logo_light: '',
    logo_dark: '',
    favicon: ''
  },
  seo: {
    meta_title: 'Legal Case Management System - Complete Law Firm Solution',
    meta_description: 'Comprehensive legal case management software for law firms. Manage cases, clients, documents, billing, and court schedules in one platform.',
    meta_keywords: 'legal case management, law firm software, case management system, legal billing, court calendar, document management'
  },
  custom_css: '',
  custom_js: '',
  section_order: ['header', 'hero', 'features', 'screenshots', 'why_choose_us', 'about', 'team', 'testimonials', 'plans', 'faq', 'newsletter', 'contact', 'footer'],
  section_visibility: {
    header: true,
    hero: true,
    features: true,
    screenshots: true,
    why_choose_us: true,
    // templates: true,
    about: true,
    team: true,
    testimonials: true,
    plans: true,
    faq: true,
    newsletter: true,
    contact: true,
    footer: true
  }
};