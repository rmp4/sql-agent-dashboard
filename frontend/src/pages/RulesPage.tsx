import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Rule {
  id: string;
  name: string;
  description: string;
  scope: string;
  prompt: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const scopeConfig: Record<string, { label: string; color: string; textColor: string }> = {
  global: { label: 'Global', color: '#F5F5F5', textColor: '#5E5E5E' },
  table: { label: 'Table', color: '#FEF3C7', textColor: '#92400E' },
  query_type: { label: 'Query Type', color: '#DBEAFE', textColor: '#1E3A8A' },
  sql_style: { label: 'SQL Style', color: '#F5F5F5', textColor: '#5E5E5E' },
  business_logic: { label: 'Business Logic', color: '#FEF3C7', textColor: '#92400E' },
  chart_preference: { label: 'Chart Preference', color: '#DBEAFE', textColor: '#1E3A8A' }
};

export function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    scope: 'global',
    prompt: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/rules')
      .then(res => res.json())
      .then(data => {
        setRules(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch rules:', err);
        setLoading(false);
      });
  }, []);

  const toggleRule = (rule: Rule) => {
    fetch(`http://localhost:8000/api/rules/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !rule.active })
    })
      .then(res => res.json())
      .then(updatedRule => {
        setRules(rules.map(r => r.id === rule.id ? updatedRule : r));
      })
      .catch(err => console.error('Failed to toggle rule:', err));
  };

  const handleCreateRule = async () => {
    if (!newRule.name.trim() || !newRule.prompt.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:8000/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRule,
          active: true
        }),
      });

      if (!response.ok) throw new Error('Failed to create rule');

      const created = await response.json();
      setRules(prev => [...prev, created]);
      setIsDialogOpen(false);
      setNewRule({
        name: '',
        description: '',
        scope: 'global',
        prompt: ''
      });
    } catch (err) {
      console.error('Failed to create rule:', err);
      alert('Failed to create rule');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="px-16 py-12">
        <div className="text-center text-[#999999]" style={{ fontFamily: 'Sora' }}>
          Loading rules...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0 px-16 py-12 bg-[#FAFAFA]">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'Sora', letterSpacing: '-0.04em' }}>
              Rules
            </h1>
            <p className="text-base" style={{ color: '#5E5E5E', fontFamily: 'Sora' }}>
              Define system behavior and preferences
            </p>
          </div>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="px-5 py-3 bg-[#DC2626] text-white font-medium text-sm hover:bg-[#B91C1C] transition-colors" 
            style={{ fontFamily: 'Sora' }}
          >
            + New Rule
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-16 pb-12">
        {rules.length === 0 ? (
          <div className="text-center py-20 border border-[#E5E5E5]">
            <p className="text-[#999999]" style={{ fontFamily: 'Sora' }}>
              No rules defined. Create rules to customize AI behavior.
            </p>
          </div>
        ) : (
          <div className="border border-[#E5E5E5]">
            <div className="flex items-center px-6 py-4 bg-[#F5F5F5] border-b border-[#E5E5E5]">
              <div className="w-[120px] text-xs font-semibold tracking-wider" style={{ color: '#999999', fontFamily: 'IBM Plex Mono', letterSpacing: '0.05em' }}>
                STATUS
              </div>
              <div className="w-[240px] text-xs font-semibold tracking-wider" style={{ color: '#999999', fontFamily: 'IBM Plex Mono', letterSpacing: '0.05em' }}>
                RULE NAME
              </div>
              <div className="flex-1 text-xs font-semibold tracking-wider" style={{ color: '#999999', fontFamily: 'IBM Plex Mono', letterSpacing: '0.05em' }}>
                DESCRIPTION
              </div>
              <div className="w-[180px] text-xs font-semibold tracking-wider" style={{ color: '#999999', fontFamily: 'IBM Plex Mono', letterSpacing: '0.05em' }}>
                SCOPE
              </div>
              <div className="w-[120px] text-xs font-semibold tracking-wider" style={{ color: '#999999', fontFamily: 'IBM Plex Mono', letterSpacing: '0.05em' }}>
                ACTIONS
              </div>
            </div>

            {rules.map((rule) => {
              const scopeStyle = scopeConfig[rule.scope] || scopeConfig.global;
              return (
                <div key={rule.id} className="flex items-center px-6 py-5 border-t border-[#E5E5E5]">
                  <div className="w-[120px]">
                    <button
                      onClick={() => toggleRule(rule)}
                      className="w-11 h-6 rounded-full transition-colors flex items-center px-0.5"
                      style={{ 
                        backgroundColor: rule.active ? '#22C55E' : '#E5E5E5',
                        justifyContent: rule.active ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div className="w-5 h-5 bg-white rounded-full" />
                    </button>
                  </div>
                  <div className="w-[240px] text-sm" style={{ fontFamily: 'Sora' }}>
                    {rule.name}
                  </div>
                  <div className="flex-1 text-sm" style={{ color: '#5E5E5E', fontFamily: 'Sora' }}>
                    {rule.description}
                  </div>
                  <div className="w-[180px]">
                    <span 
                      className="inline-block px-3 py-1.5 text-xs"
                      style={{ 
                        backgroundColor: scopeStyle.color,
                        color: scopeStyle.textColor,
                        fontFamily: 'IBM Plex Mono'
                      }}
                    >
                      {scopeStyle.label}
                    </span>
                  </div>
                  <div className="w-[120px] flex items-center gap-3">
                    <button className="text-sm font-medium" style={{ color: '#DC2626', fontFamily: 'Sora' }}>
                      Edit
                    </button>
                    <button className="text-sm font-medium" style={{ color: '#999999', fontFamily: 'Sora' }}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Rule</DialogTitle>
            <DialogDescription>
              Define a rule to customize system behavior and AI responses.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Name *
              </label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Sales Context"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Description
              </label>
              <Input
                value={newRule.description}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the rule"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Scope
              </label>
              <select
                value={newRule.scope}
                onChange={(e) => setNewRule(prev => ({ ...prev, scope: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded"
                style={{ fontFamily: 'Sora' }}
              >
                <option value="global">Global</option>
                <option value="table">Table</option>
                <option value="query_type">Query Type</option>
                <option value="sql_style">SQL Style</option>
                <option value="business_logic">Business Logic</option>
                <option value="chart_preference">Chart Preference</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Prompt *
              </label>
              <Textarea
                value={newRule.prompt}
                onChange={(e) => setNewRule(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Enter the rule instructions..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                setNewRule({
                  name: '',
                  description: '',
                  scope: 'global',
                  prompt: ''
                });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRule}
              disabled={!newRule.name.trim() || !newRule.prompt.trim() || isCreating}
              className="bg-[#DC2626] hover:bg-[#B91C1C]"
            >
              {isCreating ? 'Creating...' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
