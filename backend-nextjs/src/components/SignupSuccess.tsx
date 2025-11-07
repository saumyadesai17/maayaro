'use client';

import { motion } from 'motion/react';
import { CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SignupSuccessProps {
  email: string;
  requiresVerification: boolean;
  onNavigate: (page: string) => void;
}

export function SignupSuccess({ email, requiresVerification, onNavigate }: SignupSuccessProps) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Success Message */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6 flex justify-center"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-3xl tracking-wider mb-3">
              {requiresVerification ? 'Verify Your Email' : 'Account Created!'}
            </h1>
            
            {requiresVerification ? (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We've sent a verification link to
                </p>
                <div className="bg-secondary border border-border rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{email}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Please check your inbox and click the verification link to activate your account.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    If you don't see the email, check your spam folder or promotions tab.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your account has been successfully created!
                </p>
                <div className="bg-secondary border border-border rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{email}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  You can now sign in with your credentials.
                </p>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            {requiresVerification ? (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full py-3 bg-primary text-primary-foreground flex items-center justify-center gap-3 transition-opacity hover:opacity-90 group"
                >
                  <span className="text-sm">Go to Login</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Didn't receive the email?{' '}
                  <button
                    type="button"
                    className="text-muted-foreground opacity-50 cursor-not-allowed"
                    disabled
                    title="Resend verification email feature coming soon"
                  >
                    Resend verification email
                  </button>
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full py-3 bg-primary text-primary-foreground flex items-center justify-center gap-3 transition-opacity hover:opacity-90 group"
                >
                  <span className="text-sm">Continue to Login</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                
                <button
                  onClick={() => onNavigate('home')}
                  className="w-full py-3 border border-border hover:bg-secondary transition-colors text-sm"
                >
                  Back to Home
                </button>
              </>
            )}
          </motion.div>

          {/* Additional Info */}
          {requiresVerification && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t border-border"
            >
              <p className="text-xs text-muted-foreground">
                The verification link will expire in 24 hours.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZWxlYnJhdGlvbiUyMGZhc2hpb258ZW58MXx8fHwxNzYxNDUxNTIzfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Success"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-l from-transparent to-background/20" />
        <div className="absolute bottom-8 left-8 text-white">
          <h2 className="text-3xl tracking-[0.2em] mb-2">WELCOME</h2>
          <p className="opacity-90">Your journey with MAAYARO begins</p>
        </div>
      </div>
    </div>
  );
}
