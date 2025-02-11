class QuadTree {
  constructor(boundary, capacity) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    const { x, y, w, h } = this.boundary;
    const nw = { x: x - w / 2, y: y - h / 2, w: w / 2, h: h / 2 };
    const ne = { x: x + w / 2, y: y - h / 2, w: w / 2, h: h / 2 };
    const sw = { x: x - w / 2, y: y + h / 2, w: w / 2, h: h / 2 };
    const se = { x: x + w / 2, y: y + h / 2, w: w / 2, h: h / 2 };

    this.northwest = new QuadTree(nw, this.capacity);
    this.northeast = new QuadTree(ne, this.capacity);
    this.southwest = new QuadTree(sw, this.capacity);
    this.southeast = new QuadTree(se, this.capacity);

    this.divided = true;
  }

  insert(point) {
    if (!this.contains(this.boundary, point)) {
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    } else {
      if (!this.divided) {
        this.subdivide();
      }

      if (this.northwest.insert(point)) return true;
      if (this.northeast.insert(point)) return true;
      if (this.southwest.insert(point)) return true;
      if (this.southeast.insert(point)) return true;
    }
  }

  contains(boundary, point) {
    return (
      point.x >= boundary.x - boundary.w &&
      point.x < boundary.x + boundary.w &&
      point.y >= boundary.y - boundary.h &&
      point.y < boundary.y + boundary.h
    );
  }

  query(range, found) {
    if (!this.intersects(range, this.boundary)) {
      return found;
    }

    for (let p of this.points) {
      if (this.contains(range, p)) {
        found.push(p);
      }
    }

    if (this.divided) {
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
    }

    return found;
  }

  intersects(range, boundary) {
    return !(
      range.x - range.w > boundary.x + boundary.w ||
      range.x + range.w < boundary.x - boundary.w ||
      range.y - range.h > boundary.y + boundary.h ||
      range.y + range.h < boundary.y - boundary.h
    );
  }

  queryCircle(center, radius, found = []) {
    if (!this.intersectsCircle(center, radius, this.boundary)) {
      return found;
    }

    for (let p of this.points) {
      const distance = Math.sqrt(
        Math.pow(center.x - p.x, 2) +
        Math.pow(center.y - p.y, 2)
      );
      if (distance <= radius) {
        found.push(p);
      }
    }

    if (this.divided) {
      this.northwest.queryCircle(center, radius, found);
      this.northeast.queryCircle(center, radius, found);
      this.southwest.queryCircle(center, radius, found);
      this.southeast.queryCircle(center, radius, found);
    }

    return found;
  }

  intersectsCircle(center, radius, boundary) {
    const xDist = Math.abs(center.x - boundary.x);
    const yDist = Math.abs(center.y - boundary.y);

    const edges = Math.pow(xDist - boundary.w, 2) + Math.pow(yDist - boundary.h, 2);

    if (xDist > (radius + boundary.w) || yDist > (radius + boundary.h)) {
      return false;
    }

    if (xDist <= boundary.w || yDist <= boundary.h) {
      return true;
    }

    return edges <= Math.pow(radius, 2);
  }
}

export { QuadTree };
