const parseDateString = (dateString: string) => {
  const normalized = dateString.trim();
  if (!normalized) return null;
  if (/^\d{13}$/.test(normalized)) return new Date(Number(normalized));
  if (/^\d{10}$/.test(normalized)) return new Date(Number(normalized) * 1000);
  if (normalized.includes('T')) {
    const date = new Date(normalized);
    if (!Number.isNaN(date.getTime())) return date;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const date = new Date(`${normalized}T00:00:00`);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const matchSlash = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (matchSlash) {
    const day = Number(matchSlash[1]);
    const month = Number(matchSlash[2]);
    const year = Number(matchSlash[3]);
    const date = new Date(year, month - 1, day);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const matchDash = normalized.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (matchDash) {
    const day = Number(matchDash[1]);
    const month = Number(matchDash[2]);
    const year = Number(matchDash[3]);
    const date = new Date(year, month - 1, day);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const fallback = new Date(normalized);
  if (!Number.isNaN(fallback.getTime())) return fallback;
  return null;
};

const getTimeAgoFromDate = (date: Date) => {
  const now = new Date();
  
  // Diferença em milissegundos
  const diffMs = now.getTime() - date.getTime();
  
  // Margem de erro de 1 minuto para considerar "Agora mesmo"
  if (diffMs < 60000 && diffMs >= 0) return 'Agora mesmo';
  
  // Se a data for no futuro (devido a fuso horário ou erro de relógio), retornar "Agora mesmo"
  if (diffMs < 0) {
    // Se a diferença for pequena (menos de 1 hora), pode ser apenas dessincronização de relógio
    if (Math.abs(diffMs) < 3600000) return 'Agora mesmo';
    // Se for maior, algo está errado no parse ou fuso, mas vamos evitar mostrar "Há -4 horas"
    return 'Agora mesmo';
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44); // Média de dias por mês
  const years = Math.floor(days / 365.25); // Média de dias por ano

  if (minutes < 1) {
    return 'Agora mesmo';
  }
  if (minutes < 60) {
    return `Há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }
  if (hours < 24) {
    return `Há ${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  if (days === 1) {
    return 'Ontem';
  }
  if (days < 7) {
    return `Há ${days} dia${days !== 1 ? 's' : ''}`;
  }
  if (days < 30) {
    return `Há ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  }
  if (months < 12) {
    return `Há ${months} me${months !== 1 ? 'ses' : 's'}`;
  }
  if (years === 1) {
    return 'Há mais de um ano';
  }
  return `Há mais de ${years} anos`;
};

export const getTimeAgo = (dateInput: string | Date) => {
  if (!dateInput) return '';

  const date = dateInput instanceof Date ? dateInput : parseDateString(dateInput);
  if (!date) return '';
  return getTimeAgoFromDate(date);
};

export function timeAgo(date: string | Date): string {
    if (!date) return '';
    
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'agora mesmo';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} min atrás`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} h atrás`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} dias atrás`;
    }
    
    return past.toLocaleDateString('pt-BR');
}

export const getPostTimeAgo = (publishedAt?: string, date?: string) => {
  const published = publishedAt ? parseDateString(publishedAt) : null;
  const baseDate = date ? parseDateString(date) : null;

  if (published && baseDate) {
    const diffDays = Math.abs(published.getTime() - baseDate.getTime()) / 86400000;
    if (diffDays > 3) {
      return getTimeAgoFromDate(baseDate);
    }
    return getTimeAgoFromDate(published);
  }

  if (published) return getTimeAgoFromDate(published);
  if (baseDate) return getTimeAgoFromDate(baseDate);
  return '';
};

export const formatPostDateTime = (publishedAt?: string, date?: string) => {
  const published = publishedAt ? parseDateString(publishedAt) : null;
  const baseDate = date ? parseDateString(date) : null;
  const target = published || baseDate;
  if (!target) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(target);
};
