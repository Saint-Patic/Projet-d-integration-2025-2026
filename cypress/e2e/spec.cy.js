describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })
});

it('US_Wu_Jiale', function() {
  cy.visit('http://localhost:8081/matches/match-details?matchId=1')
  
});

it('US_Wu_Jiale', function() {
  cy.visit('http://localhost:8081/')
  cy.get('[data-testid="login-email"]').click();
  cy.get('[data-testid="login-email"]').type('tg@tg.tg');
  cy.get('[data-testid="login-password"]').click();
  cy.get('[data-testid="login-password"]').type('Azerty12345!');
  cy.get('[data-testid="login-submit"] div.css-text-146c3p1').click();
  cy.get('#root div.r-minWidth-11v9fek').click();
  cy.get('#root div.r-minWidth-11v9fek').click();
  
});

it('test', function() {
  cy.visit('http://localhost:8081/matches/match-details?matchId=1')
  cy.get('[data-testid="login-email"]').click();
  cy.get('[data-testid="login-email"]').type('tg@tg.tg');
  cy.get('[data-testid="login-password"]').click();
  cy.get('[data-testid="login-password"]').type('Azerty12345!');
  cy.get('[data-testid="login-submit"] div.css-text-146c3p1').click();
  cy.get('#root div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div.r-borderTopWidth-eujbse > div:nth-child(2) > div.r-gap-1cmwbt1 > div.r-userSelect-lrvibr > div.css-text-146c3p1').click();
  cy.get('#root div.r-color-jwli3a.r-fontSize-1i10wst').click();
  cy.get('#root div.r-color-jwli3a.r-fontSize-1i10wst').click();
  cy.get('#root div.r-color-jwli3a.r-fontSize-1i10wst').click();
  
});