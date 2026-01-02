import { ReactNode } from 'react';
import StudentsHeader from './StudentsHeader';
import StudentsFooter from './StudentsFooter';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <StudentsHeader />
      <main className="flex-1">{children}</main>
      <StudentsFooter />
    </div>
  );
};

export default PublicLayout;
