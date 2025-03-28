const Footer = ({ user, url }: { user: string | null; url: string | null }) => {
    return (
      <footer className="fixed bottom-0 right-0 p-4 text-center z-10">
        <div className="inline-flex gap-4 text-white [text-shadow:_0_1px_3px_rgba(0,0,0,0.8)]">
          {user && <span>{user}</span>}
          {url && (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              View on Pexels
            </a>
          )}
        </div>
      </footer>
    );
  };
  
  export default Footer;