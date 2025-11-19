import { Verified, VerifiedIcon } from 'lucide-react';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Camlytx AI. All rights reserved.
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {/* Version 1.0.0 */}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#FFFF55"><path d="m280-80 160-300-320-40 480-460h80L520-580l320 40L360-80h-80Zm222-247 161-154-269-34 63-117-160 154 268 33-63 118Zm-22-153Z"/></svg>
           Powered by Do365 Technologies
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;