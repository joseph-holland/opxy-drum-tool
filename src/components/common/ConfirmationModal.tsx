interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({ 
  isOpen, 
  message, 
  onConfirm, 
  onCancel 
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: '"Montserrat", "Arial", sans-serif'
      }}
      onClick={onCancel}
    >
      <div 
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: '6px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          maxWidth: '400px',
          width: '90%',
          margin: '0 1rem',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.5rem 1rem 1.5rem',
          borderBottom: '1px solid var(--color-border-subtle)'
        }}>
          <h3 style={{
            margin: '0',
            fontSize: '1.25rem',
            fontWeight: '300',
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <i className="fas fa-exclamation-triangle" style={{ 
              color: 'var(--color-text-primary)', 
              fontSize: '1.25rem' 
            }}></i>
            confirm action
          </h3>
        </div>

        {/* Content */}
        <div style={{
          padding: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontSize: '0.95rem',
          lineHeight: '1.5'
        }}>
          {message}
        </div>

        {/* Actions */}
        <div style={{
          padding: '1rem 1.5rem 1.5rem 1.5rem',
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.625rem 1.25rem',
              border: '1px solid var(--color-border-medium)',
              borderRadius: '3px',
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              minWidth: '80px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
              e.currentTarget.style.borderColor = 'var(--color-border-medium)';
              e.currentTarget.style.color = 'var(--color-interactive-dark)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
              e.currentTarget.style.borderColor = 'var(--color-border-medium)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.625rem 1.25rem',
              border: 'none',
              borderRadius: '3px',
              backgroundColor: 'var(--color-interactive-focus)',
              color: 'var(--color-white)',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              minWidth: '80px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-interactive-dark)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-interactive-focus)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ok
          </button>
        </div>
      </div>
    </div>
  );
} 