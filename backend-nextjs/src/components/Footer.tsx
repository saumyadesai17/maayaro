'use client';

import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps = {}) {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="text-2xl tracking-[0.15em] mb-4">MAAYARO</div>
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              Timeless elegance crafted with precision. Discover the perfect blend of traditional artistry and contemporary design.
            </p>
            <div className="flex gap-4">
              <button
                className="w-10 h-10 border border-background/20 hover:border-background/40 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </button>
              <button
                className="w-10 h-10 border border-background/20 hover:border-background/40 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                className="w-10 h-10 border border-background/20 hover:border-background/40 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-6 text-sm tracking-wider">SHOP</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => onNavigate?.('women')}
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Women's Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('men')}
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Men's Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('traditional')}
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Traditional Wear
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('collection')}
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Featured Items
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-6 text-sm tracking-wider">SUPPORT</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button className="text-background/70 hover:text-background transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button className="text-background/70 hover:text-background transition-colors">
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button className="text-background/70 hover:text-background transition-colors">
                  Returns & Exchange
                </button>
              </li>
              <li>
                <button className="text-background/70 hover:text-background transition-colors">
                  Size Guide
                </button>
              </li>
              <li>
                <button className="text-background/70 hover:text-background transition-colors">
                  FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-6 text-sm tracking-wider">NEWSLETTER</h3>
            <p className="text-background/70 text-sm mb-4">
              Subscribe to receive exclusive offers and updates.
            </p>
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-background/50" />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full pl-11 pr-4 py-3 bg-background/10 border border-background/20 text-background placeholder:text-background/40 focus:outline-none focus:border-background/40 transition-colors text-sm"
                />
              </div>
              <button className="w-full py-3 bg-background text-foreground hover:bg-background/90 transition-colors text-sm tracking-wide">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/60">
          <p>© 2025 MAAYARO. All rights reserved.</p>
          <div className="flex gap-6">
            <button className="hover:text-background transition-colors">
              Privacy Policy
            </button>
            <button className="hover:text-background transition-colors">
              Terms of Service
            </button>
            <button className="hover:text-background transition-colors">
              Sitemap
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
