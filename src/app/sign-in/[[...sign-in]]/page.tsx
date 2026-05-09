import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 17 17" fill="none" className="w-[17px] h-[17px]">
              <rect x="2" y="3.5" width="13" height="2.5" rx="1.25" fill="white" />
              <rect x="2" y="7.25" width="9" height="2.5" rx="1.25" fill="white" />
              <rect x="2" y="11" width="11" height="2.5" rx="1.25" fill="white" />
              <path d="M12 13.5l1.2 1.2 2.3-2.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-serif text-xl font-extrabold text-text">
            Caden<em className="text-accent not-italic">ce</em>
          </span>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-md rounded-2xl border border-border',
              headerTitle: 'font-serif font-extrabold',
              formButtonPrimary: 'bg-accent hover:opacity-90 text-white',
              footerActionLink: 'text-accent hover:text-accent/80',
            }
          }}
        />
      </div>
    </div>
  )
}
