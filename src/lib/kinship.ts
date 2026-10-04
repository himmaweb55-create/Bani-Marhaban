import { Anggota } from '../types';

export function getKinshipTitle(myId: string, targetId: string, members: Anggota[]): string {
  if (myId === targetId) return 'Saya Sendiri';

  const memberMap = new Map<string, Anggota>(members.map((m) => [m.id, m]));
  const me = memberMap.get(myId);
  const target = memberMap.get(targetId);

  if (!me || !target) return 'Kerabat Bani Marhaban';

  // Pasangan
  if (me.pasanganIds?.includes(targetId) || target.pasanganIds?.includes(myId)) {
    return target.jenisKelamin === 'L' ? 'Suami' : 'Istri';
  }

  // Orang tua saya
  if (me.ayahId === targetId) return 'Ayah';
  if (me.ibuId === targetId) return 'Ibu';

  // Anak saya
  if (target.ayahId === myId || target.ibuId === myId) {
    return target.jenisKelamin === 'L' ? 'Anak Laki-laki' : 'Anak Perempuan';
  }

  // Kakek / Nenek saya
  const myAyah = me.ayahId ? memberMap.get(me.ayahId) : undefined;
  const myIbu = me.ibuId ? memberMap.get(me.ibuId) : undefined;

  if (myAyah && (myAyah.ayahId === targetId || myAyah.ibuId === targetId)) {
    return target.jenisKelamin === 'L' ? 'Kakek (dari Ayah)' : 'Nenek (dari Ayah)';
  }
  if (myIbu && (myIbu.ayahId === targetId || myIbu.ibuId === targetId)) {
    return target.jenisKelamin === 'L' ? 'Kakek (dari Ibu)' : 'Nenek (dari Ibu)';
  }

  // Buyut
  if (target.generasi === 1 && me.generasi === 4) {
    return target.jenisKelamin === 'L' ? 'Mbah Buyut (Laki-laki)' : 'Mbah Buyut (Perempuan)';
  }

  // Cucu saya
  const myChildren = members.filter((m) => m.ayahId === myId || m.ibuId === myId);
  const myChildrenIds = new Set(myChildren.map((c) => c.id));
  if (
    (target.ayahId && myChildrenIds.has(target.ayahId)) ||
    (target.ibuId && myChildrenIds.has(target.ibuId))
  ) {
    return 'Cucu';
  }

  // Cicit saya
  if (me.generasi === 1 && target.generasi === 4) {
    return 'Cicit';
  }

  // Saudara Kandung
  const haveSameParents =
    (me.ayahId && me.ayahId === target.ayahId) ||
    (me.ibuId && me.ibuId === target.ibuId);

  if (haveSameParents) {
    const meYear = me.tahunLahir || 2000;
    const targetYear = target.tahunLahir || 2000;
    if (targetYear < meYear) {
      return target.jenisKelamin === 'L' ? 'Kakak Laki-laki' : 'Kakak Perempuan';
    } else {
      return target.jenisKelamin === 'L' ? 'Adik Laki-laki' : 'Adik Perempuan';
    }
  }

  // Paman / Bibi (saudara dari ayah atau ibu saya)
  if (myAyah) {
    const ayahSiblings = members.filter(
      (m) =>
        m.id !== myAyah.id &&
        ((m.ayahId && m.ayahId === myAyah.ayahId) || (m.ibuId && m.ibuId === myAyah.ibuId))
    );
    if (ayahSiblings.some((s) => s.id === targetId)) {
      return target.jenisKelamin === 'L' ? 'Paman (dari Ayah)' : 'Bibi (dari Ayah)';
    }
  }
  if (myIbu) {
    const ibuSiblings = members.filter(
      (m) =>
        m.id !== myIbu.id &&
        ((m.ayahId && m.ayahId === myIbu.ayahId) || (m.ibuId && m.ibuId === myIbu.ibuId))
    );
    if (ibuSiblings.some((s) => s.id === targetId)) {
      return target.jenisKelamin === 'L' ? 'Paman (dari Ibu)' : 'Bibi (dari Ibu)';
    }
  }

  // Keponakan (anak dari saudara saya)
  const mySiblings = members.filter(
    (m) =>
      m.id !== me.id &&
      ((me.ayahId && m.ayahId === me.ayahId) || (me.ibuId && m.ibuId === me.ibuId))
  );
  const siblingIds = new Set(mySiblings.map((s) => s.id));
  if (
    (target.ayahId && siblingIds.has(target.ayahId)) ||
    (target.ibuId && siblingIds.has(target.ibuId))
  ) {
    return 'Keponakan';
  }

  // Sepupu (generasi sama)
  if (me.generasi === target.generasi) {
    return 'Saudara Sepupu';
  }

  if (me.generasi < target.generasi) {
    return target.jenisKelamin === 'L' ? 'Keponakan Jauh' : 'Keponakan Jauh';
  }

  if (me.generasi > target.generasi) {
    return target.jenisKelamin === 'L' ? 'Paman / Uwak' : 'Bibi / Uwak';
  }

  return 'Kerabat Bani Marhaban';
}

export function findKinshipPath(fromId: string, toId: string, members: Anggota[]): string[] {
  if (fromId === toId) return [fromId];

  const graph = new Map<string, Set<string>>();

  const addEdge = (u: string, v: string) => {
    if (!graph.has(u)) graph.set(u, new Set());
    if (!graph.has(v)) graph.set(v, new Set());
    graph.get(u)!.add(v);
    graph.get(v)!.add(u);
  };

  members.forEach((m) => {
    if (m.ayahId) addEdge(m.id, m.ayahId);
    if (m.ibuId) addEdge(m.id, m.ibuId);
    if (m.pasanganIds && m.pasanganIds.length > 0) {
      m.pasanganIds.forEach((pId) => addEdge(m.id, pId));
    }
  });

  const queue: string[][] = [[fromId]];
  const visited = new Set<string>([fromId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];

    if (node === toId) {
      return path;
    }

    const neighbors = graph.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return [];
}
