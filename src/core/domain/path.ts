import { TowerId } from '../grid/towerId';
import { worldContainsTower } from '../grid/worldChunks';

export class Path {
  private readonly path: TowerId[];

  constructor(nodes: TowerId[]) {
    if (nodes.length < 2) {
      throw new Error('Path must have at least 2 nodes');
    }

    this.path = [...nodes].reverse();
  }

  static from(nodes: TowerId[]): Path {
    return new Path(nodes);
  }

  clone(): Path {
    return new Path(this.iter());
  }

  validate(
    hasTower: (towerId: TowerId) => boolean,
    sourceTowerId: TowerId,
    maxEdgeDistance: number | null,
    maxPathRoads: number,
  ): Path {
    if (this.path.length < 2) {
      throw new Error('path too short');
    }

    if (
      (maxEdgeDistance !== null && this.path.length !== 2) ||
      (maxEdgeDistance === null && this.path.length > maxPathRoads)
    ) {
      throw new Error('path too long');
    }

    const ordered = this.iter();
    if (!ordered[0].equals(sourceTowerId)) {
      throw new Error('source mismatch');
    }

    const maxDistanceSquared =
      maxEdgeDistance !== null ? Math.pow(maxEdgeDistance + 1, 2) - 1 : null;

    let prev = sourceTowerId;

    for (let i = 1; i < ordered.length; i += 1) {
      const next = ordered[i];

      if (next.equals(prev)) {
        throw new Error('duplicate tower in path');
      }

      if (!worldContainsTower(next)) {
        throw new Error('outside world');
      }

      if (maxDistanceSquared !== null) {
        if (prev.distanceSquared(next) > maxDistanceSquared) {
          throw new Error('edge too long');
        }
      } else if (!prev.isNeighbor(next)) {
        throw new Error('not neighbor');
      }

      if (!hasTower(next)) {
        throw new Error('not generated');
      }

      prev = next;
    }

    return this;
  }

  comingFrom(): TowerId {
    return this.path[this.path.length - 1];
  }

  goingTo(): TowerId {
    return this.path[this.path.length - 2];
  }

  source(): TowerId {
    return this.iter()[0];
  }

  destination(): TowerId {
    const nodes = this.iter();
    return nodes[nodes.length - 1];
  }

  iter(): TowerId[] {
    return [...this.path].reverse();
  }

  pop(): void {
    if (this.path.length === 0) {
      throw new Error('Cannot pop empty path');
    }
    this.path.pop();
  }

  isEmpty(): boolean {
    return this.path.length < 2;
  }

  length(): number {
    return this.path.length;
  }

  takeFirst(count: number): Path {
    return new Path(this.iter().slice(0, count));
  }
}
