import { useT } from '../useT';
import React, { useState, useEffect } from 'react';
import { useAuth, API } from '../App';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Building, Globe, Users, Search } from 'lucide-react';

const CompaniesPage = () => {
  const { token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const { t } = useT();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    website: '',
    size: '',
    description: ''
  });

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API}/companies`, {
        headers,
        withCredentials: true
      });
      setCompanies(response.data);
    } catch (error) {
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/companies`, newCompany, { headers, withCredentials: true });
      toast.success('Company added successfully');
      setIsAddDialogOpen(false);
      setNewCompany({
        name: '',
        industry: '',
        website: '',
        size: '',
        description: ''
      });
      fetchCompanies();
    } catch (error) {
      toast.error('Failed to add company');
    }
  };

  const filteredCompanies = companies.filter(company => {
    const searchLower = searchQuery.toLowerCase();
    return (
      company.name?.toLowerCase().includes(searchLower) ||
      company.industry?.toLowerCase().includes(searchLower)
    );
  });

  const sizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '500+', label: '500+ employees' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="companies-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="companies-title">{ t('companies.title') }</h1>
            <p className="text-slate-600 mt-1">Manage your business accounts</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#A100FF] hover:bg-purple-700" data-testid="add-company-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCompany} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    placeholder="e.g., Acme Corporation"
                    required
                    data-testid="company-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                    placeholder="e.g., Technology, Finance"
                    data-testid="company-industry"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                    placeholder="https://example.com"
                    data-testid="company-website"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm"
                    value={newCompany.size}
                    onChange={(e) => setNewCompany({ ...newCompany, size: e.target.value })}
                    data-testid="company-size"
                  >
                    <option value="">Select size</option>
                    {sizeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newCompany.description}
                    onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                    placeholder="Brief description of the company..."
                    rows={3}
                    data-testid="company-description"
                  />
                </div>
                <Button type="submit" className="w-full bg-[#A100FF] hover:bg-purple-700" data-testid="submit-company-btn">
                  Add Company
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search companies..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-companies"
              />
            </div>
          </CardContent>
        </Card>

        {/* Companies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#A100FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No companies found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add your first company
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="companies-grid">
            {filteredCompanies.map((company, index) => (
              <Card key={company.company_id} className="hover:shadow-md transition-shadow" data-testid={`company-card-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Building className="w-6 h-6 text-[#A100FF]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900 truncate">{company.name}</h3>
                      {company.industry && (
                        <p className="text-sm text-slate-500">{company.industry}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#A100FF] hover:text-purple-700"
                      >
                        <Globe className="w-4 h-4" />
                        {company.website.replace(/(^\w+:|^)\/\//, '')}
                      </a>
                    )}
                    {company.size && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Users className="w-4 h-4" />
                        {company.size}
                      </div>
                    )}
                  </div>

                  {company.description && (
                    <p className="mt-4 text-sm text-slate-600 line-clamp-2">{company.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompaniesPage;
