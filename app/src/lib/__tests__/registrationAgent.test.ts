import { RegistrationAgent } from '../registrationAgent';
import type { District } from '../../types/api';

const DISTRICTS: District[] = [
  { id: 'dist_nashik', name: 'Nashik', name_mr: 'नाशिक' },
  { id: 'dist_ahmednagar', name: 'Ahmednagar', name_mr: 'अहमदनगर' },
  { id: 'dist_pune', name: 'Pune', name_mr: 'पुणे' },
];

describe('RegistrationAgent — slot order', () => {
  it('starts on the name slot', () => {
    const agent = new RegistrationAgent(DISTRICTS);
    const action = agent.start();
    expect(action).toEqual({ type: 'ask', slot: 'name', question: expect.any(String) });
  });

  it('moves name -> district -> village -> done, in that order', () => {
    const agent = new RegistrationAgent(DISTRICTS);
    agent.start();

    let action = agent.next('रामभाऊ पाटील');
    expect(action.type).toBe('prefill');
    action = agent.confirm();
    expect(action).toMatchObject({ type: 'ask', slot: 'district' });

    action = agent.next('नाशिक');
    expect(action.type).toBe('prefill');
    action = agent.confirm();
    expect(action).toMatchObject({ type: 'ask', slot: 'village' });

    action = agent.next('निफाड');
    expect(action.type).toBe('prefill');
    action = agent.confirm();
    expect(action).toEqual({ type: 'done' });
  });
});

describe('RegistrationAgent — name slot', () => {
  it('prefills a trimmed non-empty transcript', () => {
    const agent = new RegistrationAgent(DISTRICTS);
    agent.start();
    const action = agent.next('  रामभाऊ पाटील  ');
    expect(action).toMatchObject({ type: 'prefill', slot: 'name', value: 'रामभाऊ पाटील' });
  });

  it('retries on an empty transcript', () => {
    const agent = new RegistrationAgent(DISTRICTS);
    agent.start();
    const action = agent.next('   ');
    expect(action).toMatchObject({ type: 'retry', slot: 'name' });
  });

  it('re-asks the name slot on deny, discarding the pending value', () => {
    const agent = new RegistrationAgent(DISTRICTS);
    agent.start();
    agent.next('चुकीचे नाव');
    const action = agent.deny();
    expect(action).toMatchObject({ type: 'ask', slot: 'name' });
    expect(agent.getValues().name).toBeUndefined();
  });
});

describe('RegistrationAgent — district slot', () => {
  function toDistrict(agent: RegistrationAgent) {
    agent.start();
    agent.next('रामभाऊ पाटील');
    agent.confirm();
    return agent;
  }

  it('matches a district by its Marathi name', () => {
    const agent = toDistrict(new RegistrationAgent(DISTRICTS));
    const action = agent.next('नाशिक');
    expect(action).toMatchObject({ type: 'prefill', slot: 'district', value: 'dist_nashik' });
  });

  it('matches a district embedded in a longer phrase ("नाशिक जिल्हा")', () => {
    const agent = toDistrict(new RegistrationAgent(DISTRICTS));
    const action = agent.next('नाशिक जिल्हा');
    expect(action).toMatchObject({ type: 'prefill', slot: 'district', value: 'dist_nashik' });
  });

  it('matches a district by its English name', () => {
    const agent = toDistrict(new RegistrationAgent(DISTRICTS));
    const action = agent.next('Pune');
    expect(action).toMatchObject({ type: 'prefill', slot: 'district', value: 'dist_pune' });
  });

  it('retries when no district matches', () => {
    const agent = toDistrict(new RegistrationAgent(DISTRICTS));
    const action = agent.next('मुंबई');
    expect(action).toMatchObject({ type: 'retry', slot: 'district' });
  });

  it('commits the matched district id on confirm', () => {
    const agent = toDistrict(new RegistrationAgent(DISTRICTS));
    agent.next('नाशिक');
    agent.confirm();
    expect(agent.getValues().districtId).toBe('dist_nashik');
  });
});

describe('RegistrationAgent — village slot (optional)', () => {
  function toVillage(agent: RegistrationAgent) {
    agent.start();
    agent.next('रामभाऊ पाटील');
    agent.confirm();
    agent.next('नाशिक');
    agent.confirm();
    return agent;
  }

  it('prefills a spoken village name', () => {
    const agent = toVillage(new RegistrationAgent(DISTRICTS));
    const action = agent.next('निफाड');
    expect(action).toMatchObject({ type: 'prefill', slot: 'village', value: 'निफाड' });
  });

  it('treats an empty transcript as "skip" — done, no confirm step', () => {
    const agent = toVillage(new RegistrationAgent(DISTRICTS));
    const action = agent.next('');
    expect(action).toEqual({ type: 'done' });
    expect(agent.getValues().village).toBeUndefined();
  });

  it('treats the spoken word "नाही" as skip, same as empty', () => {
    const agent = toVillage(new RegistrationAgent(DISTRICTS));
    const action = agent.next('नाही');
    expect(action).toEqual({ type: 'done' });
  });

  it('does not retry an empty village — skip is not a failure', () => {
    const agent = toVillage(new RegistrationAgent(DISTRICTS));
    const action = agent.next('   ');
    expect(action.type).not.toBe('retry');
  });
});

describe('RegistrationAgent — getValues / isDone', () => {
  it('accumulates all three slots by the end', () => {
    const agent = new RegistrationAgent(DISTRICTS);
    agent.start();
    agent.next('रामभाऊ पाटील');
    agent.confirm();
    agent.next('नाशिक');
    agent.confirm();
    agent.next('निफाड');
    agent.confirm();

    expect(agent.getValues()).toEqual({
      name: 'रामभाऊ पाटील',
      districtId: 'dist_nashik',
      village: 'निफाड',
    });
    expect(agent.isDone()).toBe(true);
  });

  it('is not done until all slots are confirmed', () => {
    const agent = new RegistrationAgent(DISTRICTS);
    agent.start();
    expect(agent.isDone()).toBe(false);
    agent.next('रामभाऊ पाटील');
    agent.confirm();
    expect(agent.isDone()).toBe(false);
  });
});
