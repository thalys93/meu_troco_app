import assert from 'node:assert/strict';
import type { Category, CategoryTransactionType } from '@/types/Category';
import {
    applyCategoryDrag,
    toOrderAndTypeUpdates,
} from './category-list-utils';

function cat(
    id: string,
    type: CategoryTransactionType,
    order: number
): Category {
    return {
        id,
        type,
        icon: 'Tag',
        order,
        active: true,
        createdAt: null as unknown as Category['createdAt'],
    };
}

const sections = {
    despesa: [cat('a', 'despesa', 0), cat('b', 'despesa', 1)],
    receita: [cat('c', 'receita', 0)],
    conta: [] as Category[],
};

const reordered = applyCategoryDrag(sections, 'a', 'b');
assert.ok(reordered);
assert.deepEqual(
    reordered.despesa.map((c) => c.id),
    ['b', 'a']
);
assert.equal(reordered.despesa[0].order, 0);
assert.equal(reordered.despesa[1].order, 1);

const moved = applyCategoryDrag(sections, 'a', 'conta');
assert.ok(moved);
assert.deepEqual(
    moved.despesa.map((c) => c.id),
    ['b']
);
assert.deepEqual(
    moved.conta.map((c) => c.id),
    ['a']
);
assert.equal(moved.conta[0].type, 'conta');
assert.equal(moved.conta[0].order, 0);
assert.equal(moved.despesa[0].order, 0);

const updates = toOrderAndTypeUpdates(moved, ['despesa', 'conta']);
assert.deepEqual(updates, [
    { id: 'b', order: 0, type: 'despesa' },
    { id: 'a', order: 0, type: 'conta' },
]);

const intoReceita = applyCategoryDrag(sections, 'b', 'c');
assert.ok(intoReceita);
assert.deepEqual(
    intoReceita.despesa.map((c) => c.id),
    ['a']
);
assert.deepEqual(
    intoReceita.receita.map((c) => c.id),
    ['b', 'c']
);
assert.equal(intoReceita.receita[0].type, 'receita');

assert.equal(applyCategoryDrag(sections, 'a', 'a'), null);

console.log('category-list-utils.check: ok');
