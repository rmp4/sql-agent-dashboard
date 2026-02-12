import { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DataSourceConnection {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  status: 'connected' | 'disconnected';
  created_at: string;
  updated_at: string;
}

interface TableSchema {
  tables: Record<string, Array<{ name: string; type: string; nullable: boolean }>>;
}

export function DataSourcesPage() {
  const [connections, setConnections] = useState<DataSourceConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<DataSourceConnection | null>(null);
  const [schema, setSchema] = useState<TableSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: 'postgresql',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DataSourceConnection | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'postgresql',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingConnection, setDeletingConnection] = useState<DataSourceConnection | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/data-sources')
      .then(res => res.json())
      .then(data => {
        setConnections(data);
        if (data.length > 0) {
          setSelectedConnection(data[0]);
          loadSchema(data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch data sources:', err);
        setLoading(false);
      });
  }, []);

  const loadSchema = (connectionId: string) => {
    fetch(`http://localhost:8000/api/data-sources/${connectionId}/schema`)
      .then(res => res.json())
      .then(data => setSchema(data))
      .catch(err => console.error('Failed to fetch schema:', err));
  };

  const testConnection = () => {
    if (!selectedConnection) return;
    
    setTesting(true);
    fetch(`http://localhost:8000/api/data-sources/${selectedConnection.id}/test`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConnections(prevConnections =>
            prevConnections.map(conn =>
              conn.id === selectedConnection.id
                ? { ...conn, status: 'connected' as const }
                : conn
            )
          );
          setSelectedConnection(prev => prev ? { ...prev, status: 'connected' as const } : null);
        }
        setTesting(false);
      })
      .catch(err => {
        console.error('Connection test failed:', err);
        setTesting(false);
      });
  };

  const handleCreateConnection = async () => {
    if (!newConnection.name.trim() || !newConnection.host.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:8000/api/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConnection),
      });

      if (!response.ok) throw new Error('Failed to create data source');

      const created = await response.json();
      setConnections(prev => [...prev, created]);
      setIsDialogOpen(false);
      setNewConnection({
        name: '',
        type: 'postgresql',
        host: '',
        port: 5432,
        database: '',
        username: '',
        password: ''
      });
    } catch (err) {
      console.error('Failed to create data source:', err);
      alert('Failed to create data source');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (conn: DataSourceConnection) => {
    setEditingConnection(conn);
    setEditForm({
      name: conn.name,
      type: conn.type,
      host: conn.host,
      port: conn.port,
      database: conn.database,
      username: conn.username,
      password: ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateConnection = async () => {
    if (!editingConnection || !editForm.name.trim() || !editForm.host.trim()) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`http://localhost:8000/api/data-sources/${editingConnection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update data source');

      const updated = await response.json();
      setConnections(prev => prev.map(c => c.id === updated.id ? updated : c));
      if (selectedConnection?.id === updated.id) {
        setSelectedConnection(updated);
      }
      setIsEditDialogOpen(false);
      setEditingConnection(null);
      setEditForm({
        name: '',
        type: 'postgresql',
        host: '',
        port: 5432,
        database: '',
        username: '',
        password: ''
      });
    } catch (err) {
      console.error('Failed to update data source:', err);
      alert('Failed to update data source');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (conn: DataSourceConnection) => {
    setDeletingConnection(conn);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConnection = async () => {
    if (!deletingConnection) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/data-sources/${deletingConnection.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete data source');

      setConnections(prev => prev.filter(c => c.id !== deletingConnection.id));
      if (selectedConnection?.id === deletingConnection.id) {
        setSelectedConnection(connections[0] || null);
        setSchema(null);
      }
      setIsDeleteDialogOpen(false);
      setDeletingConnection(null);
    } catch (err) {
      console.error('Failed to delete data source:', err);
      alert('Failed to delete data source');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-16 py-12">
        <div className="text-center text-[#999999]" style={{ fontFamily: 'Sora' }}>
          Loading data sources...
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
              Data Sources
            </h1>
            <p className="text-base" style={{ color: '#5E5E5E', fontFamily: 'Sora' }}>
              Manage database connections
            </p>
          </div>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="px-5 py-3 bg-[#DC2626] text-white font-medium text-sm hover:bg-[#B91C1C] transition-colors" 
            style={{ fontFamily: 'Sora' }}
          >
            + New Data Source
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-16 pb-12">
        {connections.length === 0 ? (
          <div className="text-center py-20 border border-[#E5E5E5]">
            <p className="text-[#999999]" style={{ fontFamily: 'Sora' }}>
              No data sources configured. Add your first database connection.
            </p>
          </div>
        ) : (
          <div className="flex gap-6 h-full">
            <div className="w-[400px] border border-[#E5E5E5] flex flex-col">
              <div className="flex-shrink-0 px-6 py-4 bg-[#F5F5F5] border-b border-[#E5E5E5]">
                <h3 className="text-xs font-semibold tracking-wider" style={{ color: '#999999', fontFamily: 'IBM Plex Mono', letterSpacing: '0.05em' }}>
                  CONNECTIONS
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-[#E5E5E5]">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className={`px-6 py-4 hover:bg-[#FAFAFA] cursor-pointer ${
                      selectedConnection?.id === conn.id ? 'bg-[#FAFAFA]' : ''
                    }`}
                    onClick={() => {
                      setSelectedConnection(conn);
                      loadSchema(conn.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Database size={20} className="text-[#5E5E5E] mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium mb-1" style={{ fontFamily: 'Sora' }}>
                          {conn.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs" style={{ fontFamily: 'IBM Plex Mono' }}>
                          <span style={{ color: '#5E5E5E' }}>{conn.type}</span>
                          <span>•</span>
                          <span style={{ color: conn.status === 'connected' ? '#22C55E' : '#999999' }}>
                            {conn.status === 'connected' ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(conn);
                          }}
                          className="px-2 py-1 text-xs border border-[#E5E5E5] hover:bg-white"
                          style={{ fontFamily: 'Sora' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(conn);
                          }}
                          className="px-2 py-1 text-xs border border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white"
                          style={{ fontFamily: 'Sora' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 border border-[#E5E5E5] flex flex-col">
              <div className="flex-shrink-0 px-6 py-4 bg-[#F5F5F5] border-b border-[#E5E5E5] flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-wider" style={{ color: '#999999', fontFamily: 'IBM Plex Mono', letterSpacing: '0.05em' }}>
                  SCHEMA: {selectedConnection?.name}
                </h3>
                <button
                  className="text-sm px-4 py-2 border border-[#E5E5E5] bg-white disabled:opacity-50"
                  style={{ fontFamily: 'Sora' }}
                  onClick={testConnection}
                  disabled={testing}
                >
                  {testing ? 'Testing...' : 'Test'}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {schema && schema.tables ? (
                  <div className="space-y-4">
                    {Object.entries(schema.tables).map(([tableName, columns]) => (
                      <div key={tableName}>
                        <div className="flex items-center gap-2 mb-2">
                          <Database size={16} className="text-[#5E5E5E]" />
                          <h4 className="font-medium" style={{ fontFamily: 'Sora' }}>
                            {tableName}
                          </h4>
                        </div>
                        <div className="ml-6 space-y-1">
                          {columns.map((col) => (
                            <div key={col.name} className="text-sm flex items-center gap-2" style={{ fontFamily: 'IBM Plex Mono', color: '#5E5E5E' }}>
                              <span>• {col.name}</span>
                              <span className="text-xs" style={{ color: '#999999' }}>
                                {col.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-[#999999]" style={{ fontFamily: 'Sora' }}>
                    Loading schema...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Data Source</DialogTitle>
            <DialogDescription>
              Configure a new database connection.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Name *
              </label>
              <Input
                value={newConnection.name}
                onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Production DB"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                  Host *
                </label>
                <Input
                  value={newConnection.host}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="localhost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                  Port
                </label>
                <Input
                  type="number"
                  value={newConnection.port}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, port: parseInt(e.target.value) || 5432 }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Database
              </label>
              <Input
                value={newConnection.database}
                onChange={(e) => setNewConnection(prev => ({ ...prev, database: e.target.value }))}
                placeholder="database_name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Username
              </label>
              <Input
                value={newConnection.username}
                onChange={(e) => setNewConnection(prev => ({ ...prev, username: e.target.value }))}
                placeholder="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Password
              </label>
              <Input
                type="password"
                value={newConnection.password}
                onChange={(e) => setNewConnection(prev => ({ ...prev, password: e.target.value }))}
                placeholder="password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                setNewConnection({
                  name: '',
                  type: 'postgresql',
                  host: '',
                  port: 5432,
                  database: '',
                  username: '',
                  password: ''
                });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateConnection}
              disabled={!newConnection.name.trim() || !newConnection.host.trim() || isCreating}
              className="bg-[#DC2626] hover:bg-[#B91C1C]"
            >
              {isCreating ? 'Creating...' : 'Add Connection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Source</DialogTitle>
            <DialogDescription>
              Update the database connection details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Name *
              </label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Production DB"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                  Host *
                </label>
                <Input
                  value={editForm.host}
                  onChange={(e) => setEditForm(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="localhost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                  Port
                </label>
                <Input
                  type="number"
                  value={editForm.port}
                  onChange={(e) => setEditForm(prev => ({ ...prev, port: parseInt(e.target.value) || 5432 }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Database
              </label>
              <Input
                value={editForm.database}
                onChange={(e) => setEditForm(prev => ({ ...prev, database: e.target.value }))}
                placeholder="database_name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Username
              </label>
              <Input
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Password
              </label>
              <Input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Leave empty to keep unchanged"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingConnection(null);
                setEditForm({
                  name: '',
                  type: 'postgresql',
                  host: '',
                  port: 5432,
                  database: '',
                  username: '',
                  password: ''
                });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateConnection}
              disabled={!editForm.name.trim() || !editForm.host.trim() || isUpdating}
              className="bg-[#DC2626] hover:bg-[#B91C1C]"
            >
              {isUpdating ? 'Updating...' : 'Update Connection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Data Source</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingConnection?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingConnection(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConnection}
              disabled={isDeleting}
              className="bg-[#DC2626] hover:bg-[#B91C1C]"
            >
              {isDeleting ? 'Deleting...' : 'Delete Connection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
