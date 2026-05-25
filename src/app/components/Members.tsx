import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Users,
  Plus,
  Search,
  Loader2,
  Trash2,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useAuth, isApiError, roleLabel } from '../context/AuthContext';
import { usersApi } from '../lib/api/users';
import type { ApiUser, UserRole } from '../lib/api/types';

const ROLES: UserRole[] = ['admin', 'user', 'viewer'];

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Members() {
  const { user: currentUser, isAdmin } = useAuth();
  const [members, setMembers] = useState<ApiUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newContactNo, setNewContactNo] = useState('');
  const [newRoleManual, setNewRoleManual] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [tempPasswordDialog, setTempPasswordDialog] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await usersApi.list();
      setMembers(data);
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Failed to load members.');
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadMembers();
    else setIsLoading(false);
  }, [isAdmin, loadMembers]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter((member) => {
      const name = (member.fullName ?? '').toLowerCase();
      const email = member.email.toLowerCase();
      const role = member.role.toLowerCase();
      const contact = (member.contactNo ?? '').toLowerCase();
      const roleManual = (member.jobTitle ?? '').toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        contact.includes(q) ||
        roleManual.includes(q)
      );
    });
  }, [members, searchQuery]);

  const showStatus = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 3000);
  };

  const resetAddForm = () => {
    setNewEmail('');
    setNewFullName('');
    setNewContactNo('');
    setNewRoleManual('');
    setNewRole('user');
    setNewPassword('');
    setFormError('');
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);
    try {
      if (!newEmail.trim()) {
        setFormError('Email is required.');
        setIsSaving(false);
        return;
      }

      const result = await usersApi.create({
        email: newEmail.trim(),
        fullName: newFullName.trim() || undefined,
        contactNo: newContactNo.trim() || undefined,
        roleManual: newRoleManual.trim() || undefined,
        role: newRole,
        password: newPassword.trim() || undefined,
      });
      setAddOpen(false);
      resetAddForm();
      await loadMembers();
      showStatus('Member added successfully.');
      if (result.temporaryPassword) {
        setTempPasswordDialog({
          email: result.user.email,
          password: result.temporaryPassword,
        });
      }
    } catch (err) {
      setFormError(isApiError(err) ? err.message : 'Failed to add member.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: UserRole) => {
    try {
      await usersApi.updateRole(memberId, role);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role } : m)),
      );
      showStatus('Role updated.');
    } catch (err) {
      showStatus(isApiError(err) ? err.message : 'Failed to update role.');
    }
  };

  const handleResetPassword = async (member: ApiUser) => {
    try {
      const result = await usersApi.resetPassword(member.id);
      showStatus(`Password reset for ${member.email}.`);
      if (result.temporaryPassword) {
        setTempPasswordDialog({
          email: member.email,
          password: result.temporaryPassword,
        });
      }
    } catch (err) {
      showStatus(isApiError(err) ? err.message : 'Failed to reset password.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await usersApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadMembers();
      showStatus('Member removed.');
    } catch (err) {
      showStatus(isApiError(err) ? err.message : 'Failed to remove member.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="max-w-lg mx-auto border border-border/50 mt-12">
          <CardContent className="p-8 text-center space-y-4">
            <ShieldAlert className="w-10 h-10 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-lg font-semibold">Admin access required</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Only administrators can manage team members.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Members</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage team access and roles for EngineerX
            </p>
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {statusMessage && (
        <p className="text-sm text-muted-foreground">{statusMessage}</p>
      )}

      <Card className="border border-border/50">
        <CardContent className="p-3 space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border bg-muted/30">
                    Name
                  </th>
                  <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border bg-muted/30">
                    Email
                  </th>
                  <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border bg-muted/30">
                    Contact
                  </th>
                  <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border bg-muted/30">
                    Role
                  </th>
                  <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border bg-muted/30">
                    Role (manual)
                  </th>
                  <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border bg-muted/30">
                    Status
                  </th>
                  <th className="text-left px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border bg-muted/30">
                    Joined
                  </th>
                  <th className="text-right px-3 py-2 text-[11px] font-medium text-muted-foreground border-b border-border bg-muted/30">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                      Loading members…
                    </td>
                  </tr>
                )}
                {!isLoading && error && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                )}
                {!isLoading && !error && filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                      No members found.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !error &&
                  filteredMembers.map((member) => {
                    const isSelf = member.id === currentUser?.id;
                    return (
                      <tr
                        key={member.id}
                        className="border-b border-border last:border-0 hover:bg-accent/5"
                      >
                        <td className="px-3 py-2.5 font-medium">
                          {member.fullName || '—'}
                          {isSelf && (
                            <span className="ml-1.5 text-[10px] text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{member.email}</td>
                        <td className="px-3 py-2.5 text-muted-foreground text-xs">
                          {member.contactNo || '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          <Select
                            value={member.role}
                            onValueChange={(v) =>
                              handleRoleChange(member.id, v as UserRole)
                            }
                            disabled={isSelf}
                          >
                            <SelectTrigger className="h-8 w-[8.5rem] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((role) => (
                                <SelectItem key={role} value={role} className="text-xs">
                                  {roleLabel(role)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground text-xs">
                          {member.jobTitle || '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            <Badge
                              variant={member.isActive !== false ? 'secondary' : 'outline'}
                            >
                              {member.isActive !== false ? 'Active' : 'Inactive'}
                            </Badge>
                            {member.mustChangePassword && (
                              <Badge variant="outline">Must reset password</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground text-xs">
                          {formatDate(member.createdAt)}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              aria-label={`Reset password for ${member.email}`}
                              onClick={() => handleResetPassword(member)}
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              aria-label={`Remove ${member.email}`}
                              disabled={isSelf}
                              onClick={() => setDeleteTarget(member)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            {filteredMembers.length} member{filteredMembers.length === 1 ? '' : 's'}
            {searchQuery.trim() ? ' matching search' : ''}
          </p>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={(open) => {
        setAddOpen(open);
        if (!open) resetAddForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>
              Invite a new team member. Leave password empty to auto-generate a temporary one.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder=""
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-name">Full name</Label>
              <Input
                id="member-name"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="Optional"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-contact">Contact no</Label>
              <Input
                id="member-contact"
                type="tel"
                value={newContactNo}
                onChange={(e) => setNewContactNo(e.target.value)}
                placeholder="Phone number"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role-manual">Role (manual)</Label>
              <Input
                id="member-role-manual"
                value={newRoleManual}
                onChange={(e) => setNewRoleManual(e.target.value)}
                placeholder="e.g. Senior Mechanical Engineer"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-password">Password (optional)</Label>
              <Input
                id="member-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Auto-generated if empty"
                autoComplete="new-password"
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Adding…' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              Remove <strong>{deleteTarget?.email}</strong> from the workspace? This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!tempPasswordDialog}
        onOpenChange={(open) => {
          if (!open) setTempPasswordDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Temporary password</DialogTitle>
            <DialogDescription>
              Share this password securely with {tempPasswordDialog?.email}. They will be asked to
              change it on first login.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-sm break-all">
            {tempPasswordDialog?.password}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (tempPasswordDialog?.password) {
                  navigator.clipboard.writeText(tempPasswordDialog.password).catch(() => {});
                  showStatus('Password copied to clipboard.');
                }
                setTempPasswordDialog(null);
              }}
            >
              Copy & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
