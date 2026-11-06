
import Link from 'next/link';
import PublicNavbar from '@/components/shared/PublicNavbar';
import Footer from '@/components/shared/Footer';

const vacancies = [
  {
    id: 1,
    title: 'Primary School Teacher',
    department: 'Teaching',
    type: 'Full-time',
    location: 'Sri Lanka',
  },
  {
    id: 2,
    title: 'IT Support Assistant',
    department: 'IT Department',
    type: 'Full-time',
    location: 'Sri Lanka',
  },
  {
    id: 3,
    title: 'Administrative Assistant',
    department: 'Administration',
    type: 'Part-time',
    location: 'Sri Lanka',
  },
];

export default function CareerPage() {
  return (
    <main className="min-h-screen bg-[#F4F6F5]">
      <PublicNavbar />

      {/* Introduction */}
      <section className="bg-[#14533E] text-white text-center py-16 px-6">
        <h2 className="text-4xl font-bold mb-4">
          Build Your Career With Us
        </h2>

        <p className="text-lg">
          Explore career opportunities and become part of our team.
        </p>
      </section>

      
      <Footer />
    </main>
  );
}
